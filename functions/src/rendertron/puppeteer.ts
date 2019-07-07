import * as puppeteer from 'puppeteer';
import { publicFirestore } from '../db';
import { PublicCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { Webpage } from '../../../shared-models/ssr/webpage.model';
import * as express from 'express';
import { now } from 'moment';
const db = publicFirestore;

// Courtesy of: https://developers.google.com/web/tools/puppeteer/articles/ssr
// With additional tips from: https://medium.com/@ebidel/puppeteering-in-firebase-google-cloud-functions-76145c7662bd

// // In-memory cache of rendered pages. Note: this will be cleared whenever the
// // server process stops. If you need true persistence, use something like
// // Google Cloud Storage (https://firebase.google.com/docs/storage/web/start).
// const RENDER_CACHE = new Map();

// Firebase can't handle back slashes
const createFirebaseSafeUrl = (url: string): string => {
  const removedProtocol = url.split('//').pop() as string;
  const replacedSlashes = removedProtocol.replace('/', '~1');
  return replacedSlashes;
}

const cachePage = async (url: string, request: express.Request, html: string) => {
  
  const userAgent = request.headers['user-agent'] ? `"user-agent":"${request.headers['user-agent']}"` : undefined;
  const vary = request.headers['vary'] ? `"vary":"${request.headers['vary']}"` : undefined;
  const contentType = request.headers['content-type'] ? `"content-type":"${request.headers['content-type']}"` : undefined;
  const fbSafeUrl: string = createFirebaseSafeUrl(url);

  const webpage: Webpage = {
    expires: now() + (1000 * 60 * 60 * 24 * 3), // Set expiry for three days
    headers: `{${userAgent ? `${userAgent}` : ''}${vary ? `,${vary}` : ''}${contentType ? `,${contentType}` : ''}}`,
    payload: html,
    saved: now(),
    url: fbSafeUrl.replace('~1', '/') // Revert to normal url
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
  console.log('Attempting to retrieve cached page with id: ', url);
  const fbSafeUrl = createFirebaseSafeUrl(url);
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

export const puppeteerSsr = async (url: string, request: express.Request) => {
  
  // if (RENDER_CACHE.has(url)) {
  //   return {html: RENDER_CACHE.get(url), ttRenderMs: 0};
  // }

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
  const page = await browser.newPage();
  try {
    console.log('Attempting to go to page', url);
    // networkidle0 waits for the network to be idle (no requests for 500ms).
    // The page's JS has likely produced markup by this point, but wait longer
    // if your site lazy loads, etc.
    await page.goto(url, {waitUntil: 'load'});
    console.log('Found page, waiting for selector to appear');
    await page.waitForSelector('.thumbnail'); // ensure .thumbnail class exists in the DOM.
  } catch (err) {
    console.error(err);
    throw new Error('page.goto/waitForSelector timed out.');
  }

  const html = await page.content(); // serialized HTML of page DOM.
  console.log('Selector found, fetched this html');
  await browser.close();

  const ttRenderMs = Date.now() - start;
  console.info(`Headless rendered page in: ${ttRenderMs}ms`);

  // RENDER_CACHE.set(url, html); // cache rendered page.
  await cachePage(url, request, html)
    .catch(error => {
      console.log('Error caching page', error);
      return error;
    });

  return {html, ttRenderMs};
};