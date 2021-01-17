// tslint:disable-next-line:no-import-side-effect
import 'zone.js/dist/zone-node';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';

import * as compression from 'compression';
import { handleServerRequest } from './ssr-primary-handler';

const { AppServerModule } = require('../../../app-bundle/main');

// Primary Server Function
export const customExpressApp = () => {
  
  enableProdMode();
  
  const app = express();
  
  const distFolder = __dirname + '/../../../app-bundle';

  const indexHtml = 'index-server';
  
  app.use(compression());
  
  // Define a custom express engine using the Universal Adapter
  // This engine will be reading the index HTML from the file system directly, so no need to pass it in manually
  app.engine('html', ngExpressEngine({
      bootstrap: AppServerModule,
  }) as any);
  
  app.set('view engine', 'html'); // Set the view engine to our custom adapter above
  app.set('views', distFolder); // Tell express where to find the view files, only one with an SPA
  
  // First statically serve any bundle files from the dist folder directly
  app.get('*.*', express.static(distFolder, {
      maxAge: '1y' // Cache for one year, will be replaced if new bundle
  }));
  
  app.get('*', async (req, res) => {
    await handleServerRequest(res, req, indexHtml);
  });

  return app;

}
