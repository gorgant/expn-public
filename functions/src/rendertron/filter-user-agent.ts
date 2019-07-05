import * as functions from 'firebase-functions';
// const express = require('express');
import * as express from 'express';
import * as nodeFedtch from 'node-fetch';
// const fetchReq = require('node-fetch');
// const url = require('url');
import * as url from 'url';
const app = express();


// You might instead set these as environment variables
// I just want to make this example explicitly clear
const appUrl = 'explearning-sandbox-public.firebaseapp.com';
const renderUrl = 'https://render-tron.appspot.com/render';

// Deploy your own instance of Rendertron for production
// const renderUrl = 'your-rendertron-url';



// Generates the URL 
const generateUrl = (request: express.Request) => {
  const updatedUrl: string = url.format({
    protocol: request.protocol,
    host: appUrl,
    pathname: request.originalUrl
  });
  console.log('Generated this new URL', updatedUrl);
  return updatedUrl;
  // return url.format({
  //   protocol: request.protocol,
  //   host: appUrl, 
  //   pathname: request.originalUrl
  // });
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
    'w3c_validator'
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

    // nodeFedtch.default(fullRendertronUrl)
    //   .then(response => response.text())
    //   .then(body => {

    //     // Set the Vary header to cache the user agent, based on code from:
    //     // https://github.com/justinribeiro/pwa-firebase-functions-botrender
    //     res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    //     res.set('Vary', 'User-Agent');
        
    //     res.send(body.toString())
      
    // });

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

    // // Not a bot, fetch the regular Angular app
    // // This is not an infinite loop because Firebase Hosting Priorities dictate index.html will be loaded first
    // nodeFedtch.default(`https://${appUrl}`)
    //   .then(response => response.text())
    //   .then(body => {
    //     res.send(body.toString());
    //   })
  }
  
});

export const filterUserAgent = functions.https.onRequest(app);