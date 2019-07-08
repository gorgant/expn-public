import * as functions from 'firebase-functions';
import * as express from 'express';
import * as nodeFedtch from 'node-fetch';
import * as url from 'url';
import { currentEnvironmentType } from '../environments/config';
import { EnvironmentTypes, PRODUCTION_APPS, SANDBOX_APPS } from '../../../shared-models/environments/env-vars.model';
import * as puppeteer from 'puppeteer';
import { puppeteerSsr } from './puppeteer';
let browserWSEndpoint: string;
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
  const agent = userAgent.toLowerCase();

  for (const bot of bots) {
    if (agent.indexOf(bot) > -1) {
      console.log('bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found');
  return false;

}

const detectHeadlessChrome = (userAgent: any) => {
  const agent: string = userAgent.toLowerCase();
  if (agent.includes('headlesschrome')) {
    console.log('Headless chrome detected');
    return true;
  }
  return false;
}

app.get( '*', async (req: express.Request, res: express.Response) => {

  console.log('Request received with these headers', req.headers);

  const isBot = detectBot(req.headers['user-agent']);
  const isHeadless = detectHeadlessChrome(req.headers['user-agent']);

  if (isBot) {

    const botUrl = generateUrl(req);

    if (!browserWSEndpoint) {
      const browser = await puppeteer.launch(
        {
          // No sandbox is required in cloud functions
          args: ['--no-sandbox']
        }
      );
      browserWSEndpoint = await browser.wsEndpoint();
    }

    console.log('Sending this url to puppeteer', botUrl);
    const {html, ttRenderMs} = await puppeteerSsr(botUrl, req, browserWSEndpoint)
      .catch(err => {
        console.log('Error with puppeteerSsr', err);
        return err;
      });

    console.log('Retrieved this html from puppeteer', html);

    // Add Server-Timing! See https://w3c.github.io/server-timing/.
    res.set('Server-Timing', `Prerender;dur=${ttRenderMs};desc="Headless render time (ms)"`);
    res.status(200).send(html); // Serve prerendered page as response.

  } else if (isHeadless) {

    const headlessUrl = `https://${appUrl}`;
    console.log('Fetching headless url', headlessUrl);

    const urlResponse: nodeFedtch.Response = await nodeFedtch.default(headlessUrl)
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

  } else {

    // Not a bot, fetch the regular Angular app
    
    const fullStandardUrl = `https://${appUrl}`;
    console.log('Fetching standard url', fullStandardUrl);

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

const opts = {memory: '1GB', timeoutSeconds: 60};
export const puppeteerServer = functions.runWith((opts as functions.RuntimeOptions)).https.onRequest(app);