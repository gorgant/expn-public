import * as puppeteer from 'puppeteer';

// Courtesy of: https://developers.google.com/web/tools/puppeteer/articles/ssr
// With additional tips from: https://medium.com/@ebidel/puppeteering-in-firebase-google-cloud-functions-76145c7662bd

// In-memory cache of rendered pages. Note: this will be cleared whenever the
// server process stops. If you need true persistence, use something like
// Google Cloud Storage (https://firebase.google.com/docs/storage/web/start).
const RENDER_CACHE = new Map();

// TODO: Persist the cache to firestore

export const puppeteerSsr = async (url: string) => {
  if (RENDER_CACHE.has(url)) {
    return {html: RENDER_CACHE.get(url), ttRenderMs: 0};
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
    await page.goto(url, {waitUntil: 'networkidle2'});
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

  RENDER_CACHE.set(url, html); // cache rendered page.

  return {html, ttRenderMs};
};