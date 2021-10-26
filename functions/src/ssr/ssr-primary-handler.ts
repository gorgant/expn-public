import * as functions from 'firebase-functions';
// tslint:disable-next-line:no-import-side-effect
import 'zone.js/node';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import * as express from 'express';

import { detectUaBot } from './detect-ua-bot';
import { WebpageRequestType } from '../../../shared-models/ssr/webpage-request-type.model';
import { storeWebPageCache, retrieveWebPageCache } from '../web-cache/cache-webpage';
import { PublicAppRoutes } from '../../../shared-models/routes-and-paths/app-routes.model';
import { currentEnvironmentType } from '../config/environments-config';
import { EnvironmentTypes, PRODUCTION_APPS, SANDBOX_APPS, ProductionSsrDataLoadChecks, SandboxSsrDataLoadChecks } from '../../../shared-models/environments/env-vars.model';
import { parseTransferState } from './parse-transfer-state';
import { PodcastEpisode } from '../../../shared-models/podcast/podcast-episode.model';
import { WebpageLoadFailureData } from '../../../shared-models/ssr/webpage-load-failure-data.model';
import { transmitWebpageLoadFailureDataToAdmin } from '../web-cache/transmit-webpage-load-failure-data-to-admin';
import { BlogIndexPostRef } from '../../../shared-models/posts/post.model';

// These are a few globals to help with longpage loads
let minBlogPostCount: number = ProductionSsrDataLoadChecks.EXPN_BLOG_MIN;
if (currentEnvironmentType === EnvironmentTypes.SANDBOX) {
  minBlogPostCount = SandboxSsrDataLoadChecks.EXPN_BLOG_MIN;
}
let minPodcastEpisodeCount: number = ProductionSsrDataLoadChecks.EXPN_PODCAST_MIN;
if (currentEnvironmentType === EnvironmentTypes.SANDBOX) {
  minPodcastEpisodeCount = SandboxSsrDataLoadChecks.EXPN_PODCAST_MIN;
}
let reloadAttempts = 0; // Track reload attempts
const reloadLimit = 2; // Set a max number of reload attempts

const blogFullyLoaded = (blogIndex: BlogIndexPostRef[]): boolean => {
  const blogIndexLength = blogIndex.length;
  functions.logger.log(`Found ${blogIndexLength} posts in blog index`);
  if (blogIndexLength > (minBlogPostCount - 1)) return true;
  return false;
}

const podcastFullyLoaded = (podcastIndex: PodcastEpisode[]): boolean => {
  const podcastIndexLength = podcastIndex.length;
  functions.logger.log(`Found ${podcastIndexLength} episodes in podcast index`);
  if (podcastIndexLength > (minPodcastEpisodeCount - 1)) return true;
  return false;
}

const isAutoCache = (req: express.Request): boolean => {
  if (req.query[`${WebpageRequestType.AUTO_CACHE}`]) {
    functions.logger.log('Auto cache detected');
    return true;
  }
  return false;
}

const renderAndCachePageWithUniversal = async (res: express.Response, req: express.Request, userAgent: string) => {

  const requestPath = req.path;
  
  // Log in console page reload attempts if they exist
  if (reloadAttempts > 0) {
    functions.logger.log(`Longpage reload attempt ${reloadAttempts} initiated`);
  }

  // Encode reserved characters found in URL (ngExpressEngine cannot process these and will produce a route error)
  const ngExpressSafeUrl = requestPath.replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16);
  });
  functions.logger.log('ngExpressSafeUrl', ngExpressSafeUrl);

  // See more render options here: https://github.com/angular/universal/tree/master/modules/express-engine
  res.render('index-server', { 
      req,
      url: ngExpressSafeUrl
    }, async (error, html) => {

      functions.logger.log('Rendering with Universal ngExpressEngine')
      // Exit function if error
      if (error) {
        functions.logger.log('error rendering html', error);
        res.sendStatus(500);
        return;
      }

      // If blog or podcast, check if these longer pages fully loaded (sometimes fails), if fails reattempt up to the limit
      if ((requestPath === PublicAppRoutes.BLOG || requestPath === PublicAppRoutes.PODCAST) && reloadAttempts < reloadLimit) {
        
        const transferStateData = parseTransferState(html, requestPath);

        // Check if data fully loaded, if not, make another attempt
        switch (requestPath) {
          case PublicAppRoutes.BLOG:
            const blogIndex: BlogIndexPostRef[] = transferStateData as BlogIndexPostRef[];
            if (!blogFullyLoaded(blogIndex)) {
              reloadAttempts ++;
              functions.logger.log(`Blog failed to load fully on attempt number ${reloadAttempts}, trying again`)
              return renderAndCachePageWithUniversal(res, req, userAgent);
            }
            functions.logger.log('Blog passed item length check');
            break;
          case PublicAppRoutes.PODCAST:
            const podcastIndex: PodcastEpisode[] = transferStateData as PodcastEpisode[];
            if (!podcastFullyLoaded(podcastIndex)) {
              reloadAttempts ++;
              functions.logger.log(`Podcast failed to load fully on attempt number ${reloadAttempts}, trying again`)
              return renderAndCachePageWithUniversal(res, req, userAgent);
            }
            functions.logger.log('Podcast passed item length check');
            break;
          default:
            break;
        }
      }
    
    if (reloadAttempts >= reloadLimit) {
      functions.logger.log(`Exceeded reload limit after ${reloadAttempts} attempts, using data from most recent load`);
      const webpageLoadFailureData: WebpageLoadFailureData = {
        domain: currentEnvironmentType === EnvironmentTypes.SANDBOX ? SANDBOX_APPS.expnPublicApp.websiteDomain : PRODUCTION_APPS.expnPublicApp.websiteDomain,
        urlPath: requestPath,
        errorMessage: `Not all the required items loaded after ${reloadAttempts} attempts`
      }
      await transmitWebpageLoadFailureDataToAdmin(webpageLoadFailureData)
        .catch(err => {console.error('Error transmiting webpage load failture data to admin:', err);}); // Don't throw error, just log it to console
    }

    reloadAttempts = 0; // Reset reload attempts for future functions

    // WE COULD COMPLETELY SIMPLFY ALL THE FOLLOWING CODE BY ONLY CACHING MANUAL/SCHEDULED AUTO REQUESTS
    // Designate routes that shouldn't be cached
    const nonCachableAppRoutes: PublicAppRoutes[] = [
      PublicAppRoutes.BLOG, // Excluded by default, only run these on admin auto-cache requests
      PublicAppRoutes.PRODUCTS, // Excluded by default, only run these on admin auto-cache requests
      PublicAppRoutes.CHECKOUT,
      PublicAppRoutes.SUB_CONFIRMATION,
      PublicAppRoutes.HOME, // We will put home in manually since "/" directory is too broad
      PublicAppRoutes.PURCHASE_CONFIRMATION,
      PublicAppRoutes.PRIVACY_POLICY,
      PublicAppRoutes.TERMS_AND_CONDITIONS
    ];

    // Create an array of cachable app routes from the complete set of publicAppRoutes
    const cachableAppRoutes = Object.values(PublicAppRoutes).reduce((result, appRoute) => {
      // Only push results that aren't included in the nonCachable array
      if (!nonCachableAppRoutes.includes(appRoute)) {
        result.push(appRoute);
      }
      return result;
    }, [] as PublicAppRoutes[]);

    functions.logger.log('Generated this list of cachable app routes', cachableAppRoutes);

    // Only cache request path if it matches a cachable route as defined above or matches the home route or is an auto cache request
    for (const validRoute of cachableAppRoutes) {
      // Match a valid route exactly or a valid route plus an 8-character ID plus a slash followed by a wild card (https://regex101.com/ for info on the regex string)
      if (
        requestPath === validRoute || 
        requestPath === '/' || 
        // requestPath.match(new RegExp(validRoute + '\/[a-zA-Z0-9]{8,8}\/.*')) || // match any product or blog routes
        isAutoCache(req) // for Blog and Product routes, only respond to admin auto cache requests (prevents bot bloat in cache of fake urls)
        ) {
        functions.logger.log(`Cachable route detected, submitted for caching`);
        // Cache HTML in database for easy future retrieval
        await storeWebPageCache(requestPath, userAgent, html)
          .catch(err => {console.error(`Error storing webpagecache:`, err);}); // Don't throw error, just log it to console
        break; // Break loop if match is found to prevent multiple caches per request
      }
    }

    functions.logger.log('Html rendered, first 100 chars are', html.substr(0, 100));
    res.status(200).send(html);
    return;
  });
}

export const handleServerRequest = async (res: express.Response, req: express.Request, indexHtml: "index.original.html" | "index" | "index-server") => {
  // Render the index view (name of file w/ out extension)
  // The engine will use the reqest data to determine the correct route to render
  // It will then serve that view to the client
  functions.logger.log('Routing through Cloud Functions server', req);
  functions.logger.log('Received route request', req);
  functions.logger.log('Req referrer:', req.headers.referer);
  functions.logger.log('Found these headers', req.headers);
  functions.logger.log('Found these parameters', req.query)

  const url = req.path;
  functions.logger.log('Requested url is', url);
  const userAgent: string = (req.headers['user-agent'] as string) ? (req.headers['user-agent'] as string) : '';
  const isBot = detectUaBot(userAgent);
  const isGoogleBot: boolean = userAgent.toLowerCase().includes('googlebot') ? true : false;
  const requestType = isAutoCache(req) ? WebpageRequestType.AUTO_CACHE : (
      isGoogleBot ? WebpageRequestType.GOOGLE_BOT : (
        isBot ? WebpageRequestType.OTHER_BOT : WebpageRequestType.NO_BOT
      )
    );
  functions.logger.log('Detected this request type', requestType);

  // If auto-cache request, bypass cache check and perform render request
  if (requestType === WebpageRequestType.AUTO_CACHE) {
    await renderAndCachePageWithUniversal(res, req, userAgent);
    return;
  }

  // Retrieve cached page if it exists
  const cachedPage = await retrieveWebPageCache(url, isBot);

  // If cached page exists, return that and end the function
  if (cachedPage) {
    functions.logger.log('Returning cached page payload');
    res.status(200).send(cachedPage.payload);
    return;
  }

  // If cached page doesn't exist, render with universal
  await renderAndCachePageWithUniversal(res, req, userAgent);

  return;
}