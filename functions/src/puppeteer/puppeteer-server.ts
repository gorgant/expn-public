import * as functions from 'firebase-functions';
import * as express from 'express';
import * as nodeFedtch from 'node-fetch';
import * as url from 'url';
import { publicAppUrl } from '../environments/config';
import { puppeteerSsr } from './puppeteer';
import { WebpageRequestType } from '../../../shared-models/ssr/webpage-request-type.model';
import { PuppeteerResponse } from '../../../shared-models/ssr/puppeteer-response';

const appUrl = publicAppUrl;

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
    'quora-bot/1.0',
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

const detectGoogleBot = (userAgent: string): boolean => {
  const isGoogleBot: boolean = userAgent.toLowerCase().includes('googlebot') ? true : false;
  return isGoogleBot;
}

const renderOnClient = async (userAgent: string, res: express.Response) => {
  console.log('Rendering on client');

  const isHeadless = detectHeadlessChrome(userAgent);

  if (isHeadless) {
    console.log('Headless request detected');
  }

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

const preRenderWithPuppeteer = async (req: express.Request, userAgent: string, res: express.Response) => {

  const isGoogleBot = detectGoogleBot(userAgent);
  const requestType = isGoogleBot ? WebpageRequestType.GOOGLE_BOT : WebpageRequestType.OTHER_BOT;
  const botUrl = generateUrl(req);

  console.log('Sending this url to puppeteer', botUrl);
  const puppeteerResponse: PuppeteerResponse = await puppeteerSsr(botUrl, userAgent, requestType)
    .catch(err => {
      console.log('Error with puppeteerSsr', err);
      return err;
    });
  
  // If response is empty, switch to rendering on client
  if (puppeteerResponse.emptyResponse) {
    await renderOnClient(userAgent, res);
    return;
  }

  console.log('Pre-rendering with puppeteer response', puppeteerResponse.html);

  // Add Server-Timing! See https://w3c.github.io/server-timing/.
  res.set('Server-Timing', `Prerender;dur=${puppeteerResponse.ttRenderMs};desc="Headless render time (ms)"`);
  res.status(200).send(puppeteerResponse.html); // Serve prerendered page as response.
}




/////// DEPLOYABLE FUNCTIONS ///////

const app = express().get( '*', async (req: express.Request, res: express.Response) => {

  console.log('Request received with these headers', req.headers);

  const userAgent: string = (req.headers['user-agent'] as string) ? (req.headers['user-agent'] as string) : '';
  const isBot = detectBot(userAgent);

  if (isBot) {
    await preRenderWithPuppeteer(req, userAgent, res);
  } else {
    await renderOnClient(userAgent, res);
  }
  
});

const opts = {memory: '1GB', timeoutSeconds: 60};
export const puppeteerServer = functions.runWith((opts as functions.RuntimeOptions)).https.onRequest(app);