import * as functions from 'firebase-functions';
import * as express from 'express';
import * as nodeFedtch from 'node-fetch';
import * as url from 'url';
import { publicProjectId, currentEnvironmentType } from '../environments/config';
import { EnvironmentTypes, PRODUCTION_APPS, SANDBOX_APPS } from '../../../shared-models/environments/env-vars.model';
const app = express();

let appUrl: string;

switch (currentEnvironmentType) {
  case EnvironmentTypes.PRODUCTION:
    appUrl = PRODUCTION_APPS.publicApp.websiteDomain;
    break;
  case EnvironmentTypes.SANDBOX:
    appUrl = SANDBOX_APPS.publicApp.websiteDomain;
    break;
  default:
    appUrl = SANDBOX_APPS.publicApp.websiteDomain;
    break;
}

// Deploy your own instance of Rendertron for production
const renderUrl = `https://${publicProjectId}.appspot.com/render`;



// Generates the URL using the correct public host domain (vs the request version which will point you to cloudfunctions.net)
const generateUrl = (request: express.Request) => {
  const updatedUrl: string = url.format({
    protocol: 'https',
    host: appUrl,
    pathname: request.originalUrl
  });
  console.log('Generated this new URL', updatedUrl);
  return updatedUrl;
}

  // List of bots to target, add more if you'd like
const detectBot = (userAgent: any) => {

  const bots = [
    // search engine crawler bots
    'googlebot',
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'slurp',
    // social media link bots
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'baiduspider',
    'pinterest',
    'slackbot',
    'vkshare',
    'facebot',
    'outbrain',
    'w3c_validator',
    'quora link preview',
    'rogerbot',
    'showyoubot',
    'telegramBot',
    'vkshare',
    'whatsapp',
  ]


  // Return true if the user-agent header matches a bot namespace
  const agent = userAgent.toLowerCase()

  for (const bot of bots) {
    if (agent.indexOf(bot) > -1) {
      console.log('bot detected', bot, agent)
      return true
    }
  }

  console.log('no bots found')
  return false

}

app.get( '*', async (req: express.Request, res: express.Response) => {

  console.log('Request received with these headers', req.headers);

  const isBot = detectBot(req.headers['user-agent']);

  if (isBot) {

    const botUrl = generateUrl(req);
    // If Bot, fetch url via rendertron

    const fullRendertronUrl = `${renderUrl}/${botUrl}`;
    console.log('Using this rendertronUrl', fullRendertronUrl);

    const urlResponse: nodeFedtch.Response = await nodeFedtch.default(fullRendertronUrl)
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

    const processRes = (body: string) => {
      // Set the Vary header to cache the user agent, based on code from:
        // https://github.com/justinribeiro/pwa-firebase-functions-botrender
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        res.set('Vary', 'User-Agent');
        
        res.send(body.toString());
    }

    processRes(resBody);

  } else {

    // Not a bot, fetch the regular Angular app
    
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

  }
  
});

export const filterUserAgent = functions.https.onRequest(app);