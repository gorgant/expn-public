import * as functions from 'firebase-functions';
import { PublicFunctionNames } from '../../../shared-models/routes-and-paths/fb-function-names';
import { WebpageUrl } from '../../../shared-models/ssr/webpage-url.model';
import * as https from 'https';
import * as url from 'url';
import { WebpageRequestType } from '../../../shared-models/ssr/webpage-request-type.model';

/////// DEPLOYABLE FUNCTIONS ///////

const opts = {memory: '256MB', timeoutSeconds: 20};

// Listen for pubsub message
export const updateWebpageCache = functions.runWith((opts as functions.RuntimeOptions)).pubsub.topic(PublicFunctionNames.UPDATE_WEBPAGE_CACHE).onPublish( async (message, context) => {
  console.log('Context from pubsub', context);
  const wepageUrl = (message.json as WebpageUrl).url;
  console.log('Message from pubsub', wepageUrl);
  
  const urlObject = new url.URL(wepageUrl);
  urlObject.searchParams.set(`${WebpageRequestType.AUTO_CACHE}`, 'true');
  const reqOptions: https.RequestOptions = {
    host: urlObject.host,
    path: `${urlObject.pathname}?${urlObject.searchParams}`,
    method: 'GET',
  }

  console.log('Sending cache update request to universal with these options', reqOptions);


  const requestPromise = new Promise<string>(async (resolve, reject) => {

    const req = https.request(reqOptions, (res) => {
    
    let fullData: string;

      // Build fullData string (this is called multiple times)
      res.on('data', async (d) => {
        const dataBuffer = d as Buffer;
        const stringData = dataBuffer.toString('utf8');
        fullData += stringData;
      });

      res.on('end', () => {
        console.log('Response end reached in request promise')
        resolve(fullData);
      })
    });
  
    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });

  const response = await requestPromise;

  if (response) {
    return `Update succeeded with this response ${response}`;
  }

  return `Update executed with no response`;

});