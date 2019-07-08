import * as puppeteer from 'puppeteer';
import { publicFirestore } from '../db';
import { PublicCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { Webpage } from '../../../shared-models/ssr/webpage.model';
import * as express from 'express';
import { now } from 'moment';
const db = publicFirestore;

// Courtesy of: https://developers.google.com/web/tools/puppeteer/articles/ssr
// With additional tips from: https://medium.com/@ebidel/puppeteering-in-firebase-google-cloud-functions-76145c7662bd

// Firebase can't handle back slashes
const createOrReverseFirebaseSafeUrl = (url: string, reverse?: boolean): string => {
  if (reverse) {
    const urlWithSlashes = url.replace(/~1/g,'/') // Revert to normal url
    return urlWithSlashes;
  }
  const removedProtocol = url.split('//').pop() as string;
  const replacedSlashes = removedProtocol.replace(/\//g,'~1');
  return replacedSlashes;
}

// Store cache in Firebase for rapid access
const cachePage = async (url: string, request: express.Request, html: string) => {
  
  const userAgent = request.headers['user-agent'] ? `"user-agent":"${request.headers['user-agent']}"` : undefined;
  const vary = request.headers['vary'] ? `"vary":"${request.headers['vary']}"` : undefined;
  const contentType = request.headers['content-type'] ? `"content-type":"${request.headers['content-type']}"` : undefined;
  const fbSafeUrl: string = createOrReverseFirebaseSafeUrl(url);

  const webpage: Webpage = {
    expires: now() + (1000 * 60 * 60 * 24 * 3), // Set expiry for three days
    headers: `{${userAgent ? `${userAgent}` : ''}${vary ? `,${vary}` : ''}${contentType ? `,${contentType}` : ''}}`,
    payload: html,
    saved: now(),
    url: createOrReverseFirebaseSafeUrl(fbSafeUrl, true) // Revert to normal url
  }
  
  

  const fbRes = await db.collection(PublicCollectionPaths.PUBLIC_SITE_CACHE).doc(fbSafeUrl).set(webpage)
    .catch(error => {
      console.log('Error connecting to firebase', error);
      return error;
    });
    console.log('Web page cached');
    return fbRes;
}

const retrieveCachedPage = async (url: string): Promise<Webpage | undefined> => {
  const fbSafeUrl = createOrReverseFirebaseSafeUrl(url);
  console.log('Attempting to retrieve cached page with id: ', fbSafeUrl);
  const pageDoc: FirebaseFirestore.DocumentSnapshot = await db.collection(PublicCollectionPaths.PUBLIC_SITE_CACHE).doc(fbSafeUrl).get()
    .catch(error => {
      console.log('Error fetching cached page doc', error)
      return error;
    });
  if (pageDoc.exists) {
    const webPageData = pageDoc.data() as Webpage;
    console.log('Cached page exists', webPageData);
    return webPageData;
  }

  console.log('No cached page found');
  return undefined;
}

/**
 * @param {string} url URL to prerender.
 * @param {request} request Request being processed by the server (used for caching headers)
 */

export const puppeteerSsr = async (url: string, request: express.Request) => {
  
  const cachedPage = await retrieveCachedPage(url);

  if (cachedPage) {
    console.log('Returning cached page payload', cachedPage.payload);
    return {html: cachedPage.payload, ttRenderMs: 0};
  }

  const start = Date.now();

  
  const browser = await puppeteer.launch(
        {
          // No sandbox is required in cloud functions
          args: ['--no-sandbox']
        }
      );
  // const browser = await puppeteer.connect({browserWSEndpoint});

  const page = await browser.newPage();
  try {

    console.log('Attempting to intercept requests before loading page');
    // 1. Intercept network requests.
    await page.setRequestInterception(true);

    // TODO: SEE IF I CAN INTERCEPT THE LINGERING FIRESTORE XHR REQUEST THAT TAKES FOREVER TO RUN
    page.on('request', req => {
      // 2. Ignore requests for resources that don't produce DOM
      // (images, stylesheets, media).
      const whitelist = ['document', 'script', 'xhr', 'fetch'];
      if (!whitelist.includes(req.resourceType())) {
        return req.abort();
      }

      // 3. Pass through all other requests.
      return req.continue();
    });

    console.log('Attempting to go to page', url);
    // networkidle0 waits for the network to be idle (no requests for 500ms).
    // The page's JS has likely produced markup by this point, but wait longer
    // if your site lazy loads, etc.
    await page.goto(url, {waitUntil: 'load'});
    console.log('Found page, waiting for selector to appear');

    // TODO: FIGURE OUT A DIFFERENT SELECTOR THAT APPLIES TO ALL PAGES, BEST TO MAKE A NEW ONE THAT CAN BE USED ON ALL OF THEM
    await page.waitForSelector('.puppeteer-loaded'); // ensure .thumbnail class exists in the DOM.
  } catch (err) {
    console.error(err);
    throw new Error('page.goto/waitForSelector timed out.');
  }

  const html = await page.content(); // serialized HTML of page DOM.
  console.log('Selector found, fetched this html', html);
  await browser.close();

  const ttRenderMs = Date.now() - start;
  console.info(`Headless rendered page in: ${ttRenderMs}ms`);

  // RENDER_CACHE.set(url, html); // cache rendered page.
  await cachePage(url, request, html)
    .catch(error => {
      console.log('Error caching page', error);
      return error;
    });

  await browser.close(); // Close the page we opened here (not the browser, which gets reused).
  
  // console.log('Closing browser page');
  // await page.close(); // Close the page we opened here (not the browser, which gets reused).


  return {html, ttRenderMs};
};