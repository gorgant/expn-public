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
import { currentEnvironmentType } from '../config/environments-config';
import { EnvironmentTypes, PRODUCTION_APPS, SANDBOX_APPS, ProductionSsrDataLoadChecks, SandboxSsrDataLoadChecks } from '../../../shared-models/environments/env-vars.model';
import { parseTransferState } from './parse-transfer-state';
import { PodcastEpisode } from '../../../shared-models/podcast/podcast-episode.model';
import { WebpageLoadFailureData } from '../../../shared-models/ssr/webpage-load-failure-data.model';
import { transmitWebpageLoadFailureDataToAdmin } from '../web-cache/transmit-webpage-load-failure-data-to-admin';
import { BlogIndexPostRef } from '../../../shared-models/posts/post.model';

// Also consider Universal with Nest in Cloud Run https://fireship.io/courses/angular/ssr-nest/

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../../../app-bundle/main');



// These are a few globals to help with longpage loads
let minBlogPostCount: number = ProductionSsrDataLoadChecks.EXPLEARNING_BLOG_MIN;
if (currentEnvironmentType === EnvironmentTypes.SANDBOX) {
  minBlogPostCount = SandboxSsrDataLoadChecks.EXPLEARNING_BLOG_MIN;
}
let minPodcastEpisodeCount: number = ProductionSsrDataLoadChecks.EXPLEARNING_PODCAST_MIN;
if (currentEnvironmentType === EnvironmentTypes.SANDBOX) {
  minPodcastEpisodeCount = SandboxSsrDataLoadChecks.EXPLEARNING_PODCAST_MIN;
}
let reloadAttempts = 0; // Track reload attempts
const reloadLimit = 2; // Set a max number of reload attempts

const blogFullyLoaded = (blogIndex: BlogIndexPostRef[]): boolean => {
  const blogIndexLength = blogIndex.length;
  console.log(`Found ${blogIndexLength} posts in blog index`);
  if (blogIndexLength > (minBlogPostCount - 1)) return true;
  return false;
}

const podcastFullyLoaded = (podcastIndex: PodcastEpisode[]): boolean => {
  const podcastIndexLength = podcastIndex.length;
  console.log(`Found ${podcastIndexLength} episodes in podcast index`);
  if (podcastIndexLength > (minPodcastEpisodeCount - 1)) return true;
  return false;
}

const renderAndCachePageWithUniversal = async (res: express.Response, req: express.Request, userAgent: string) => {

  const requestPath = req.path;
  
  // Log in console page reload attempts if they exist
  if (reloadAttempts > 0) {
    console.log(`Longpage reload attempt ${reloadAttempts} initiated`);
  }

  // Encode reserved characters found in URL (ngExpressEngine cannot process these and will produce a route error)
  const ngExpressSafeUrl = requestPath.replace(/[!'()*]/g, (c) => {
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
        console.log('error rendering html', error);
        res.sendStatus(500);
        return;
      }

      // If blog or podcast, check if these longer pages fully loaded (sometimes fails), if fails reattempt up to the limit
      if ((requestPath === PublicAppRoutes.BLOG || requestPath === PublicAppRoutes.PODCAST) && reloadAttempts < reloadLimit) {
        
        const transferStateData = parseTransferState(html, requestPath);

        // Check if data fully loaded, if not, make another attempt
        switch (requestPath) {
          case PublicAppRoutes.BLOG:
            const blogIndex: BlogIndexPostRef[] = transferStateData as BlogIndexPostRef[];
            if (!blogFullyLoaded(blogIndex)) {
              reloadAttempts ++;
              console.log(`Blog failed to load fully on attempt number ${reloadAttempts}, trying again`)
              return renderAndCachePageWithUniversal(res, req, userAgent);
            }
            console.log('Blog passed item length check');
            break;
          case PublicAppRoutes.PODCAST:
            const podcastIndex: PodcastEpisode[] = transferStateData as PodcastEpisode[];
            if (!podcastFullyLoaded(podcastIndex)) {
              reloadAttempts ++;
              console.log(`Podcast failed to load fully on attempt number ${reloadAttempts}, trying again`)
              return renderAndCachePageWithUniversal(res, req, userAgent);
            }
            console.log('Podcast passed item length check');
            break;
          default:
            break;
        }
      }
    
    if (reloadAttempts >= reloadLimit) {
      console.log(`Exceeded reload limit after ${reloadAttempts} attempts, using data from most recent load`);
      const webpageLoadFailureData: WebpageLoadFailureData = {
        domain: currentEnvironmentType === EnvironmentTypes.SANDBOX ? SANDBOX_APPS.explearningPublicApp.websiteDomain : PRODUCTION_APPS.explearningPublicApp.websiteDomain,
        urlPath: requestPath,
        errorMessage: `Not all the required items loaded after ${reloadAttempts} attempts`
      }
      await transmitWebpageLoadFailureDataToAdmin(webpageLoadFailureData)
        .catch(err => {console.error('Error transmiting webpage load failture data to admin:', err);}); // Don't throw error, just log it to console
    }

    reloadAttempts = 0; // Reset reload attempts for future functions

    // Designate routes that shouldn't be cached
    const nonCachableAppRoutes: PublicAppRoutes[] = [
      PublicAppRoutes.CHECKOUT,
      PublicAppRoutes.SUB_CONFIRMATION,
      PublicAppRoutes.HOME, // We will put home in manually since it is too broad
      PublicAppRoutes.PURCHASE_CONFIRMATION,
      PublicAppRoutes.PRIVACY_POLICY,
      PublicAppRoutes.TERMS_AND_CONDITIONS
    ];

    // Create an array of cachable app routes
    const cachableAppRoutes = Object.values(PublicAppRoutes).reduce((result, appRoute) => {
      // Only push results that aren't included in the nonCachable array
      if (!nonCachableAppRoutes.includes(appRoute)) {
        result.push(appRoute);
      }
      return result;
    }, [] as PublicAppRoutes[]);

    console.log('Generated this list of cachable app routes', cachableAppRoutes);

    // Only cache request path if it matches a cachable route as defined above or matches the home route
    for (const validRoute of cachableAppRoutes) {
      // Match a valid route exactly or a valid route plus an 8-character ID plus a slash followed by a wild card (https://regex101.com/ for info on the regex string)
      if (requestPath === validRoute || requestPath === '/' || requestPath.match(new RegExp(validRoute + '\/[a-zA-Z0-9]{8,8}\/.*'))) {
        console.log(`Cachable route detected, submitted for caching`);
        // Cache HTML in database for easy future retrieval
        await storeWebPageCache(requestPath, userAgent, html)
          .catch(err => {console.error(`Error storing webpagecache:`, err);}); // Don't throw error, just log it to console
        break; // Break loop if match is found to prevent multiple caches per request
      }
    }

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
