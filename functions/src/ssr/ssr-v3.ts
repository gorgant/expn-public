import * as functions from 'firebase-functions';
import { customExpressApp } from './app-server';

// Increase readability in Cloud Logging
require("firebase-functions/lib/logger/compat");

const expressApp = customExpressApp();

const opts = {memory: '512MB', timeoutSeconds: 20};
export const ssrV3 = functions
  .region('us-central1')
  .runWith(opts as functions.RuntimeOptions)
  .https
  .onRequest(expressApp);