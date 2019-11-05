import * as functions from 'firebase-functions';

import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
// tslint:disable-next-line:no-import-side-effect
import 'zone.js/dist/zone-node';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import * as express from 'express';
import { enableProdMode } from '@angular/core';

// import * as compression from 'compression';

import { readFileSync } from 'fs';
import {renderModuleFactory} from '@angular/platform-server';

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../../../app-bundle/main');

const customExpressApp = () => {

  const distFolder = __dirname + '/../../../app-bundle';
  
  enableProdMode();
  
  const app = express();
  
  const indexHtml = readFileSync(distFolder + '/index-server.html', 'utf-8').toString();

  // app.use(compression());
  
  // OLD MANUAL SERVER
  app.get('*.*', express.static(distFolder, {
      // maxAge: '1y'
      maxAge: '0'
  }));
  
  app.route('*').get((req, res) => {
  
      console.log('Received route request');
  
      renderModuleFactory(AppServerModuleNgFactory, {
          document: indexHtml,
          url: req.url,
          extraProviders: [provideModuleMap(LAZY_MODULE_MAP)]
      })
          .then(html => {
              console.log('Sending route response');
              res.status(200).send(html);
          })
          .catch(err => {
              console.log(err);
              res.sendStatus(500);
          });
  
  });
  
  // const distFolder = '/srv/lib/app-bundle';
  
  // app.use(compression());
  
  // // Define a custom express engine using the Universal Adapter
  // // This engine will be reading the index HTML from the file system directly, so no need to pass it in manually
  // app.engine('html', ngExpressEngine({
  //     bootstrap: AppServerModuleNgFactory,
  //     // Configure Angular specific injectable services only available on server
  //     providers: [
  //       provideModuleMap(LAZY_MODULE_MAP), // Enable lazy loading functionality
  //     ]
  // }) as any);
  
  // app.set('view engine', 'html'); // Set the view engine to our custom adapter above
  // app.set('views', distFolder); // Tell express where to find the view files, only one with an SPA
  
  // // First statically serve any bundle files from the dist folder directly
  // app.get('*.*', express.static(distFolder, {
  //     maxAge: '1y' // Cache for one year, will be replaced if new bundle
  // }));
  
  // app.get('*', (req, res) => {
  //     // Render the index view (name of file w/ out extension)
  //     // The engine will use the reqest data to determine the correct route to render
  //     // It will then serve that view to the client
  //     console.log('Receiving route request');
  //     res.render('index-server', { req });
  // });

  return app;

}

/////// DEPLOYABLE FUNCTIONS ///////

const opts = {memory: '1GB', timeoutSeconds: 20};
export const baseUniversalSsr = functions.runWith((opts as functions.RuntimeOptions)).https.onRequest(customExpressApp());
