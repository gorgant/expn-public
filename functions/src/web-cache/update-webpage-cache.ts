import * as functions from 'firebase-functions';
import { PublicTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';
import { WebpageUrl } from '../../../shared-models/ssr/webpage-url.model';
import * as https from 'https';
import * as url from 'url';
import { WebpageRequestType } from '../../../shared-models/ssr/webpage-request-type.model';

// Create an http request for the provided url
const sendHttpRequest = async (wepageUrl: string) => {
  const urlObject = new url.URL(wepageUrl);
  urlObject.searchParams.set(`${WebpageRequestType.AUTO_CACHE}`, 'true');
  const reqOptions: https.RequestOptions = {
    host: urlObject.host,
    path: `${urlObject.pathname}?${urlObject.searchParams}`,
    method: 'GET',
  }

  functions.logger.log('Sending cache update request to universal with these options', reqOptions);


  const requestResponse = new Promise<string>(async (resolve, reject) => {

    const req = https.request(reqOptions, (res) => {
    
    let fullData: string;

      // Build fullData string (this is called multiple times)
      res.on('data', async (d) => {
        const dataBuffer = d as Buffer;
        const stringData = dataBuffer.toString('utf8');
        fullData += stringData;
      });

      res.on('end', () => {
        resolve(fullData);
      })
    });
  
    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });

  await requestResponse
    .catch(err => {functions.logger.log(`Http request failed:`, err); throw new functions.https.HttpsError('internal', err);});
}

/////// DEPLOYABLE FUNCTIONS ///////

const opts = {memory: '256MB', timeoutSeconds: 20};

// Listen for pubsub message
export const updateWebpageCache = functions.runWith((opts as functions.RuntimeOptions)).pubsub.topic(PublicTopicNames.SAVE_WEBPAGE_TO_CACHE_TOPIC).onPublish( async (message, context) => {
  
  const wepageUrl = (message.json as WebpageUrl).url;
  functions.logger.log('Update Webpage Cache request received with this data', wepageUrl)
  functions.logger.log('Context from pubsub', context);

  return sendHttpRequest(wepageUrl);
});