import * as functions from 'firebase-functions';
import { PublicFunctionNames } from '../../../shared-models/routes-and-paths/fb-function-names';
import { WebpageUrl } from '../../../shared-models/ssr/webpage-url.model';
import { puppeteerSsr } from './puppeteer';
import { WebpageRequestType } from '../../../shared-models/ssr/webpage-request-type.model';

const opts = {memory: '1GB', timeoutSeconds: 60};

// Listen for pubsub message
export const updateWebpageCache = functions.runWith((opts as functions.RuntimeOptions)).pubsub.topic(PublicFunctionNames.SAVE_WEBPAGE_TO_CACHE_TOPIC).onPublish( async (message, context) => {
  console.log('Context from pubsub', context);
  const wepageUrl = (message.json as WebpageUrl).url;
  console.log('Message from pubsub', wepageUrl);

  const fakeReq = {
    headers: {
      'user-agent': 'explearning auto-cache'
    }
  } as any;

  const updateResponse = await puppeteerSsr(wepageUrl, fakeReq, WebpageRequestType.AUTO_CACHE) // Cacheupdate === true ensures proper caching behavior
    .catch(error => {
      console.log('Error with puppeteerSsr during autocache');
      return error;
    }) // Note this is a cache update

  if (updateResponse.html) {
    return `Updated succeeded in ${updateResponse.ttRenderMs} ms`;
  }

  return `Update executed with no response`;
});