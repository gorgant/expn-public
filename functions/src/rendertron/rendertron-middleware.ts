import * as functions from 'firebase-functions';
import * as express from 'express';
import * as nodeFedtch from 'node-fetch';
import { publicProjectId, currentEnvironmentType } from '../environments/config';
import * as rendertron from 'rendertron-middleware';
import { EnvironmentTypes } from '../../../shared-models/environments/env-vars.model';
const app = express();

let appUrl: string;

switch (currentEnvironmentType) {
  case EnvironmentTypes.PRODUCTION:
    appUrl = `myexpelarning.com`;
    break;
  case EnvironmentTypes.SANDBOX:
    appUrl = `${publicProjectId}.firebaseapp.com`;
    break;
  default:
    appUrl = `${publicProjectId}.firebaseapp.com`;
    break;
}

// Deploy your own instance of Rendertron for production
const renderUrl = `https://${publicProjectId}.appspot.com/render`;

const BOTS = rendertron.botUserAgents.concat('googlebot');
const BOT_UA_PATTERN = new RegExp(BOTS.join('|'), 'i');


// FATAL ERROR: THIS WORKS WELL EXCEPT THAT IN THE MIDDELWARE IT USES THE REQUEST ROUTE, WHICH IS A FIREBASE LINK IT CAN'T ACCESS
// IF I COULD PASS THAT IN HERE, IT WOULD WORK, BUT ALAS, I CANNOT, SO THIS WON'T WORK
app.use(rendertron.makeMiddleware({
  proxyUrl: renderUrl,
  userAgentPattern: BOT_UA_PATTERN
}));

// // Static Assets
// app.get('*.*', express.static('public'));

// Point all routes to index...
app.get('*', async (req, res) => {
  res.set('Vary', 'User-Agent');
  // res.sendFile(DIST_FOLDER + '/index.html');

  
  // Not a bot, fetch the regular Angular app
  console.log('Using the post-middlware app.get function, serving app url');
    
  const fullStandardUrl = `https://${appUrl}`;

  const urlResponse: nodeFedtch.Response = await nodeFedtch.default(fullStandardUrl)
    .catch(err => {
      console.log('Error fetching url response', err);
      return err;
    });
  console.log('Fetched this url response', urlResponse);

  const resBody: string = await urlResponse.text()
    .catch(err => {
      console.log('Error fetching res body', err);
      return err;
    });

  // This is not an infinite loop because Firebase Hosting Priorities dictate index.html will be loaded first
  const processRes = (body: string) => {
    res.send(body.toString());
  }
  
  processRes(resBody);
});

export const rendertronMiddleware = functions.https.onRequest(app);
