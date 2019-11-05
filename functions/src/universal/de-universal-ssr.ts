// This is a modified version of David East's Firebase Universal package

import { Provider, enableProdMode } from '@angular/core';
import * as functions from 'firebase-functions';
import * as express from 'express';
// import { angularUniversal, ServerConfiguration } from 'angular-universal-express';

import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
// tslint:disable-next-line:no-import-side-effect
import 'zone.js/dist/zone-node';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../../../app-bundle/main');

export type Trigger = functions.TriggerAnnotated & ((req: Express.Request, resp: Express.Response) => void);

interface ServerConfiguration {
  main: string;
  index: string;
  enableProdMode?: boolean;
  staticDirectory?: string;
}

export interface FirebaseConfiguration extends ServerConfiguration {
  staticDirectory?: string;
  cdnCacheExpiry: number;
  browserCacheExpiry: number;
  staleWhileRevalidate?: number;
  extraProviders?: Provider[]
}

const manualConfig: FirebaseConfiguration = {
  index: '/srv/lib/app-bundle/index-server.html', // Reference the client index file which was moved to the lib folder and renamed index-server.html
  main: '/srv/lib/app-bundle/main', // Reference the Angular Universal generated main bundle stored in the Lib folder (output set in angular.json)
  enableProdMode: true,
  cdnCacheExpiry: 600, // cache in the CDN for 10 minutes
  browserCacheExpiry: 604800, // cache in the browser for 1 week
  staleWhileRevalidate: 120, // serve a stale version for 2 minutes after cdnCacheExpiry, but refresh CDN in background
  extraProviders: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}

// /**
//  * Create a Cloud Function HTTPS Trigger configured to generate
//  * Angular Universal responses.
//  * @param config 
//  */
// export let trigger = (config: FirebaseConfiguration): Trigger => {

//   // GCR: Temporarily set to manual config
//   return functions.https.onRequest(createExpressApp(manualConfig));
// };

/**
 * Create an express app configued to generate Angular Universal
 * responses. Note: a static directory that contains your static
 * Angular assets must be supplied. Otherwise each asset request 
 * will trigger a dynamic response.
 * @param config 
 */
const customExpressApp = (config: FirebaseConfiguration) => {
  
  if (config.enableProdMode) {
    enableProdMode();
  }

  const app = express();
  const distFolder = '/srv/lib/app-bundle';

  /** 
   * An express static directory is not usually neccessary when  
   * in use with Firebase Hosting. Hosting will always prefer 
   * existing static assets to dynamic routes. 
   */
  if(valueExists(config.staticDirectory)) {
    app.use(express.static(config.staticDirectory!));
  }



  // GCR: This is the angular express engine firing up
  // Define a custom express engine using the Universal Adapter
  // This engine will be reading the index HTML from the file system directly, so no need to pass it in manually
  app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    // Configure Angular specific injectable services only available on server
    providers: [provideModuleMap(LAZY_MODULE_MAP)] // Enable lazy loading functionality
  }) as any);
  app.set('view engine', 'html'); // Set the view engine to our custom adapter above
  app.set('views', distFolder); // Tell express where to find the view files, only one with an SPA


  const cacheControlValue = getCacheControlHeader(config);
  // middleware that applies a Cache-Control header to each dynamic response
  app.use((req, res, next) => {
    res.set('Cache-Control', cacheControlValue);
    next();
  });

  // First statically serve any bundle files from the dist folder directly
  app.get('*.*', express.static(distFolder, {
    maxAge: '1y' // Cache for one year, will be replaced if new bundle
  }));
  // Then dynmaically serve anything else
  app.get('*', (req, res) => {
    // Render the index view (name of file w/ out extension)
    // The engine will use the reqest data to determine the correct route to render
    // It will then serve that view to the client
    console.log('Receiving route request');
    // res.render('index', { req });
    res.render('index-server', { req });
  });

  
  // // TODO: switch to using ngExpressEngine per the server.ts in the root folder
  // app.get('/*', angularUniversal(config));
  return app;
}

function valueExists(value?: any) {
  return !(typeof value === 'undefined' || value === null);
}

/**
 * Checks a given configuration for Cache-Control header values 
 * and either returns the supplied values or the default values (0).
 * @param config 
 */
function checkCacheControlValue(config: FirebaseConfiguration) {
  let cdnCacheExpiry = 0
  let browserCacheExpiry = 0;
  let staleWhileRevalidate = 0;
  if(valueExists(config.cdnCacheExpiry)) {
    cdnCacheExpiry = config.cdnCacheExpiry;
  }
  if(valueExists(config.browserCacheExpiry)) {
    browserCacheExpiry = config.browserCacheExpiry;
  }
  if(valueExists(config.staleWhileRevalidate)) {
    staleWhileRevalidate = config.staleWhileRevalidate!;
  }
  return { cdnCacheExpiry, browserCacheExpiry, staleWhileRevalidate };
}

/**
 * Returns the Cache-Control header value given a config object.
 * @param config 
 */
function getCacheControlHeader(config: FirebaseConfiguration) {
  const { cdnCacheExpiry, browserCacheExpiry, staleWhileRevalidate } = checkCacheControlValue(config);
  return `public, max-age=${browserCacheExpiry}, s-maxage=${cdnCacheExpiry}, stale-while-revalidate=${staleWhileRevalidate}`;
}



/////// DEPLOYABLE FUNCTIONS ///////

const opts = {memory: '1GB', timeoutSeconds: 60};
export const universalSsr = functions.runWith((opts as functions.RuntimeOptions)).https.onRequest(customExpressApp(manualConfig));