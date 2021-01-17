import * as functions from 'firebase-functions';
import { customExpressApp } from './app-server';

require("firebase-functions/lib/logger/compat");

// Courtesy of https://www.thkp.co/blog/2020/6/22/how-to-serve-angular-universal-with-an-existing-express-server
// This essentially "double renders", first on the cloud function, then in the local server app, weird but works
// Seems to be the only way to get SSR to work in Ivy because there's no way to otherwise get AppServerModule in the cloud ngExpressEngine to work without missing metadata issues (see ssr-v3 for that error)
// Only other alternative is ssr-v2, running the entire logic in the local app through server.ts, in which case you are accessing cloud functions from the client, which is limiting and requires weaker security

// Instantiate the app from server.ts (which is compiled into main)
const localServerApp = require('../../../app-bundle/main').app;

const customServer = customExpressApp()

const distFolder = __dirname + '/../../../app-bundle';

// Feed the custom cloud functions express app into the local server app
const opts = {memory: '512MB', timeoutSeconds: 20};
export const ssrV4 = functions
  .region('us-central1')
  .runWith(opts as functions.RuntimeOptions)
  .https
  .onRequest(localServerApp(customServer, distFolder));