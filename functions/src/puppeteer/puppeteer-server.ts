import * as functions from 'firebase-functions';
import * as express from 'express';
import * as nodeFedtch from 'node-fetch';
import * as url from 'url';
import { publicAppUrl } from '../environments/config';
import { puppeteerSsr } from './puppeteer';
import { WebpageRequestType } from '../../../shared-models/ssr/webpage-request-type.model';
import { PuppeteerResponse } from '../../../shared-models/ssr/puppeteer-response';
import { UAParser } from 'ua-parser-js';
import { PublicAppRoutes } from '../../../shared-models/routes-and-paths/app-routes.model';

const appUrl = publicAppUrl;

// Generates the URL using the correct public host domain (vs the request version which will point you to cloudfunctions.net)
const generateUrl = (request: express.Request) => {
  const updatedUrl: string = url.format({
    protocol: 'https',
    host: appUrl,
    pathname: request.originalUrl
  });
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

const renderOnClient = async (res: express.Response) => {
  console.log('Rendering on client');

  // For some reason, only need the root directory here (rather than the sub directory of the queried url)
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
    res.status(200).send(body.toString());
  }
  
  processRes(resBody);
  console.log('Client res sent', resBody);
}

// Prevent arbitrary server requests from unknown domains
const validateServerRequest = (request: express.Request) => {

  // Check that host domain is cloudfunctions.net
  const hostDomain: string = request.hostname.split('.')[request.hostname.split('.').length-2];
  if (hostDomain !== 'cloudfunctions') {
    console.log('Invalid host domain', hostDomain);
    return false;
  }

  // Check that proxy host is valid
  const proxyHost: string = request.headers['x-forwarded-host'] as string;
  if (proxyHost !== appUrl) {
    console.log('Invalid proxy host', proxyHost);  
    return false;
  }

  console.log(`Is valid request with this hostDomain ${hostDomain} and this proxyHost ${proxyHost}`);
  return true;
}

const validateUrlPath = (request: express.Request): boolean => {
  
  const targetUrl = generateUrl(request);
  

  const contentUrlArray: string[] = Object.values(PublicAppRoutes).map(pageSlugWithSlashPrefix => {
    const pageUrl: string = `https://${appUrl}${pageSlugWithSlashPrefix}`;
    
    // Exclude the home page route to prevent universal matches
    if (pageSlugWithSlashPrefix === '') {
      return 'home page invalid';
    }
    return pageUrl;
  });
  
  // Check if target URL includes a valid content path
  if (contentUrlArray.find(regex => targetUrl.includes(regex))) {
    return true;
  }
  console.log('Invalid path', targetUrl);
  return false;

}

const preRenderWithPuppeteer = async (req: express.Request, userAgent: string, res: express.Response, isBot: boolean) => {

  const isGoogleBot = detectGoogleBot(userAgent);
  const requestType = isGoogleBot ? WebpageRequestType.GOOGLE_BOT : WebpageRequestType.OTHER_BOT;
  const targetUrl = generateUrl(req);

  console.log('Sending this url to puppeteer', targetUrl);
  const puppeteerResponse: PuppeteerResponse = await puppeteerSsr(targetUrl, userAgent, requestType, isBot)
    .catch(err => {
      console.log('Error with puppeteerSsr', err);
      return err;
    });
  
  // If response is empty, switch to rendering on client
  if (puppeteerResponse.emptyResponse) {
    await renderOnClient(res);
    return;
  }

  console.log('Pre-rendering with puppeteer response', puppeteerResponse.html);

  // Add Server-Timing! See https://w3c.github.io/server-timing/.
  res.set('Server-Timing', `Prerender;dur=${puppeteerResponse.ttRenderMs};desc="Headless render time (ms)"`);
  res.status(200).send(puppeteerResponse.html); // Serve prerendered page as response.
  console.log('Pupp res sent');
}

const detectMobileDevice = (userAgent: string): boolean => {
  
  // const uaParser = new parser.UAParser();
  const uaParser = new UAParser(userAgent);
  const parserResult = uaParser.getResult();
  console.log('UA Parser response', parserResult);
  const deviceType = parserResult.device.type;
  console.log('Detected device', deviceType);
  if (deviceType === 'mobile') {
    return true;
  }
  return false;
}




/////// DEPLOYABLE FUNCTIONS ///////

const app = express().get( '*', async (req: express.Request, res: express.Response) => {

  console.log('Request received with these headers', req.headers);

  const userAgent: string = (req.headers['user-agent'] as string) ? (req.headers['user-agent'] as string) : '';
  const isBot = detectBot(userAgent);
  const isValidRequest = validateServerRequest(req);
  const isHeadless = detectHeadlessChrome(userAgent);
  const isMobileDevice = detectMobileDevice(userAgent);
  const isValidPath = validateUrlPath(req);

  // If bot with valid request, render with puppeteer
  if (isBot && isValidRequest && isValidPath) {
    await preRenderWithPuppeteer(req, userAgent, res, isBot);
    return;
  }

  // Render headless and invalid requests on client
  if (isHeadless || !isValidPath || !isValidRequest) {
    await renderOnClient(res); 
    return;
  }

  // Render human non-mobile devices on client
  if (!isBot && !isMobileDevice) {
    await renderOnClient(res); 
    return;
  }

  // Render bots and human mobile with puppeteer
  if (isBot || isMobileDevice) {
    await preRenderWithPuppeteer(req, userAgent, res, isBot);
    return;
  }

  // Render any other non-matches on client
  await renderOnClient(res);
});

const opts = {memory: '1GB', timeoutSeconds: 60};
export const puppeteerServer = functions.runWith((opts as functions.RuntimeOptions)).https.onRequest(app);