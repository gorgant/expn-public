import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

/**
 * This is a slightly modified version of the boilerplate server.ts that comes with Angular Universal schematics
 * Courtesy of https://www.thkp.co/blog/2020/6/22/how-to-serve-angular-universal-with-an-existing-express-server
 * This essentially "double renders", first on the cloud function, then in the local server app, weird but works
 * Seems to be the only way to get SSR to work in Ivy because there's no way to otherwise get AppServerModule in the cloud ngExpressEngine to work without missing metadata issues (see ssr-v3 for that error)
 * Only other alternative is ssr-v2, running the entire logic in the local app through server.ts, in which case you are accessing cloud functions from the client, which is limiting and requires weaker security
 * @param server The custom express server imported from the cloud function containing the custom route handling and caching logic
 * @param distFolder The distFolder containing the index.html file and app bundle (currently custom npm script moves the index file from dist to the functions/lib/app-bundle folder and renames it index-server.html)
 */

// The Express app is exported so that it can be used by serverless Functions.
export function app(server: express.Express, distFolder: string) {

  const indexHtml = existsSync(join(distFolder, 'index-server.html')) ? 'index-server.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4000;

  const distFolder = join(process.cwd(), '/../../../app-bundle');
  const baseServer = express();
  // Start up the Node server
  const server = app(baseServer, distFolder);
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';