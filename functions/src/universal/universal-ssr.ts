import * as functions from 'firebase-functions';

import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
// tslint:disable-next-line:no-import-side-effect
import 'zone.js/dist/zone-node';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import * as express from 'express';
import { enableProdMode } from '@angular/core';

import * as compression from 'compression';
import { detectUaBot } from '../web-cache/detect-ua-bot';
import { WebpageRequestType } from '../../../shared-models/ssr/webpage-request-type.model';
import { storeWebPageCache, retrieveWebPageCache } from '../web-cache/cache-webpage';
import { PublicAppRoutes } from '../../../shared-models/routes-and-paths/app-routes.model';
import { currentEnvironmentType } from '../environments/config';
import { EnvironmentTypes } from '../../../shared-models/environments/env-vars.model';

// Also consider Universal with Nest in Cloud Run https://fireship.io/courses/angular/ssr-nest/

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../../../app-bundle/main');

// These are a few globals to help with longpage loads
let charLimit = 900000; // Min length for blog page (this may need to be increased)
if (currentEnvironmentType === EnvironmentTypes.SANDBOX) {
  charLimit = 100000; // reduce charlimit if sandbox
}
let reloadAttempts = 0; // Track reload attempts

const renderAndCachePageWithUniversal = async (res: express.Response, req: express.Request, userAgent: string) => {

  // Log in console page reload attempts if they exist
  if (reloadAttempts > 0) {
    console.log(`Longpage reload attempt ${reloadAttempts} initiated`);
  }

  // Encode reserved characters found in URL (ngExpressEngine cannot process these and will produce a route error)
  const ngExpressSafeUrl = req.path.replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16);
  });
  console.log('ngExpressSafeUrl', ngExpressSafeUrl);

  // See more render options here: https://github.com/angular/universal/tree/master/modules/express-engine
  res.render('index-server', { 
      req,
      url: ngExpressSafeUrl
    }, async (error, html) => {

      console.log('Rendering with Universal ngExpressEngine')
      // Exit function if error
      if (error) {
        console.log('error rendering html');
        res.sendStatus(500);
        return;
      }

      // If blog or podcast, check if these longer pages fully loaded (sometimes fails)
      if (req.path === PublicAppRoutes.BLOG || req.path === PublicAppRoutes.PODCAST) {
        // If html fails char limit, exit function and re-attempt the render (up to the max attempts)
        if (html.length < charLimit && reloadAttempts < 2) {
          console.log('Longpage load failed charLimit check, re-running')
          reloadAttempts ++;
          return renderAndCachePageWithUniversal(res, req, userAgent);
        }

        // If exceeds reloadAttempts, exit out of function with whatever it has (prevents overwriting cache with incomplete version)
        if (html.length < charLimit && reloadAttempts >= 2) {
          console.log(`Longpage load exceeded limit with ${reloadAttempts} attemps. Aborting with incomplete data as response.`);
          res.status(200).send(html);
          return;
        }

        // Otherwise, continue with cache storage
        console.log('Longpage length passed charlimit check');
    }

    reloadAttempts = 0; // Reset reload attempts for future functions

    // Cache HTML in database for easy future retrieval
    await storeWebPageCache(req.path, userAgent, html)
      .catch(err => {
        console.log('Error caching page', err);
        return err;
      });

    console.log('Html rendered, first 100 chars are', html.substr(0, 100));
    res.status(200).send(html);
    return;
  });
}


// Primary Server Function
const customExpressApp = () => {
  
  enableProdMode();
  
  const app = express();
  
  const distFolder = __dirname + '/../../../app-bundle';
  
  app.use(compression());
  
  // Define a custom express engine using the Universal Adapter
  // This engine will be reading the index HTML from the file system directly, so no need to pass it in manually
  app.engine('html', ngExpressEngine({
      bootstrap: AppServerModuleNgFactory,
      // Configure Angular specific injectable services only available on server
      providers: [
        provideModuleMap(LAZY_MODULE_MAP), // Enable lazy loading functionality
      ]
  }) as any);
  
  app.set('view engine', 'html'); // Set the view engine to our custom adapter above
  app.set('views', distFolder); // Tell express where to find the view files, only one with an SPA
  
  // First statically serve any bundle files from the dist folder directly
  app.get('*.*', express.static(distFolder, {
      maxAge: '1y' // Cache for one year, will be replaced if new bundle
  }));
  
  app.get('*', async (req, res) => {
      // Render the index view (name of file w/ out extension)
      // The engine will use the reqest data to determine the correct route to render
      // It will then serve that view to the client
      console.log('Received route request', req);
      console.log('Req referrer:', req.headers.referer);
      console.log('Found these headers', req.headers);
      console.log('Found these parameters', req.query)

      const url = req.path;
      console.log('Requested url is', url);
      const userAgent: string = (req.headers['user-agent'] as string) ? (req.headers['user-agent'] as string) : '';
      const isBot = detectUaBot(userAgent);
      const isGoogleBot: boolean = userAgent.toLowerCase().includes('googlebot') ? true : false;
      const requestType = req.query[`${WebpageRequestType.AUTO_CACHE}`] ? WebpageRequestType.AUTO_CACHE : (
          isGoogleBot ? WebpageRequestType.GOOGLE_BOT : (
            isBot ? WebpageRequestType.OTHER_BOT : WebpageRequestType.NO_BOT
          )
        );
      console.log('Detected this request type', requestType);

      // If auto-cache request, bypass cache check and perform render request
      if (requestType === WebpageRequestType.AUTO_CACHE) {
        console.log('Auto cache detected');
        await renderAndCachePageWithUniversal(res, req, userAgent);
        console.log('This fired after auto cache render as a test');
        return;
      }

      // Retrieve cached page if it exists
      const cachedPage = await retrieveWebPageCache(url, isBot);

      // If cached page exists, return that and end the function
      if (cachedPage) {
        console.log('Returning cached page payload');
        res.status(200).send(cachedPage.payload);
        return;
      }

      // If cached page doesn't exist, render with universal
      await renderAndCachePageWithUniversal(res, req, userAgent);

      return;
  });

  return app;

}

/////// DEPLOYABLE FUNCTIONS ///////

const opts = {memory: '512MB', timeoutSeconds: 20};
export const universalSsr = functions.runWith((opts as functions.RuntimeOptions)).https.onRequest(customExpressApp());
