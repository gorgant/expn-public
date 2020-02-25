import * as functions from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import { publicFirestore } from '../config/db-config';
import { SharedCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { publicProjectId, publicAppUrl } from '../config/environments-config';
import { PublicTopicNames } from '../../../shared-models/routes-and-paths/fb-function-names';
import { WebpageUrl } from '../../../shared-models/ssr/webpage-url.model';
import { Post } from '../../../shared-models/posts/post.model';
import { Product } from '../../../shared-models/products/product.model';
import { PublicAppRoutes } from '../../../shared-models/routes-and-paths/app-routes.model';
import { convertToFriendlyUrlFormat } from '../config/global-helpers';

const db = publicFirestore;
const appUrl = publicAppUrl;
const pubSub = new PubSub();

const publishUrltoSsrTopic = async (url: string) => {

  const projectId = publicProjectId;
  const topicName = PublicTopicNames.SAVE_WEBPAGE_TO_CACHE_TOPIC;
  const topic = pubSub.topic(`projects/${projectId}/topics/${topicName}`);
  const pubsubMsg: WebpageUrl = { url };
  const topicPublishRes = await topic.publishJSON(pubsubMsg)
    .catch(err => {console.log(`Failed to publish to topic "${topicName}" on project "${projectId}":`, err); return err;});
  console.log(`Publish to topic "${topicName}" on project "${projectId}" succeeded:`, topicPublishRes);

  return topicPublishRes;
}



/////// DEPLOYABLE FUNCTIONS ///////

// A cron job triggers this function, which sends an array of individual transmissions of urls to get updated asynchronously
export const transmitWebpageUrlsToSsr = functions.https.onRequest( async (req, res ) => {
  console.log('Update web cache request received with these headers', req.headers);

  // Abort if request came from invalid source
  if (req.headers['user-agent'] !== 'Google-Cloud-Scheduler') {
    console.log('Invalid request, ending operation');
    return;
  }

  const postCollectionSnapshot: FirebaseFirestore.QuerySnapshot = await db.collection(SharedCollectionPaths.POSTS).get()
    .catch(err => {console.log(`Failed to fetch post collection from public database:`, err); return err;});
  const blogSlugWithSlashPrefix = PublicAppRoutes.BLOG;
  const postUrlArray: string[] = postCollectionSnapshot.docs.map(doc => {
    const post: Post = doc.data() as Post;
    const postSlug: string = convertToFriendlyUrlFormat(post.title);
    const postUrl: string = `https://${appUrl}${blogSlugWithSlashPrefix}/${post.id}/${postSlug}`;
    return postUrl;
  });

  const productCollectionSnapshot: FirebaseFirestore.QuerySnapshot = await db.collection(SharedCollectionPaths.PRODUCTS).get()
    .catch(err => {console.log(`Failed to fetch product collection from public database:`, err); return err;});
  const productListSlugWithSlashPrefix = PublicAppRoutes.PRODUCTS;
  const productUrlArray: string[] = productCollectionSnapshot.docs.map(doc => {
    const product: Product = doc.data() as Product;
    const productSlug: string = convertToFriendlyUrlFormat(product.name);
    const productUrl: string = `https://${appUrl}${productListSlugWithSlashPrefix}/${product.id}/${productSlug}`;
    return productUrl;
  });

  const contentUrlArray: string[] = Object.values(PublicAppRoutes).map(pageSlugWithSlashPrefix => {
    const pageUrl: string = `https://${appUrl}${pageSlugWithSlashPrefix}`;
    return pageUrl;
  })


  const webpageUrlArray: string [] = postUrlArray.concat(productUrlArray,contentUrlArray);
  console.log('Compiled this wepageUrlArray', webpageUrlArray);

  // const testUrlArray: string [] = contentUrlArray;
  // console.log('Compiled this test array', testUrlArray);
  
  const transmitCacheRequests = webpageUrlArray.map( async (url) => {
    console.log('Transmit url to ssr received with this data', url);
    await publishUrltoSsrTopic(url)
      .catch(err => {console.log(`Error transmitting url to ssr:`, err); return err;});
  })

  const transmissionResponse = await Promise.all(transmitCacheRequests)
    .catch(err => {console.log(`Error in group promise to transmit url to ssr:`, err); return err;});
  
  console.log('All cache update requests sent', res);
  return res.status(200).send(transmissionResponse);
})