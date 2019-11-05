import * as functions from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import { publicFirestore } from '../db';
import { SharedCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { publicProjectId, publicAppUrl } from '../environments/config';
import { PublicFunctionNames } from '../../../shared-models/routes-and-paths/fb-function-names';
import { WebpageUrl } from '../../../shared-models/ssr/webpage-url.model';
import { Post } from '../../../shared-models/posts/post.model';
import { Product } from '../../../shared-models/products/product.model';
import { PublicAppRoutes } from '../../../shared-models/routes-and-paths/app-routes.model';
import { convertToFriendlyUrlFormat } from '../global-helpers';

const db = publicFirestore;
const appUrl = publicAppUrl;
const pubSub = new PubSub();

const publishUrltoSsrTopic = async (url: string) => {

  const urlObject: WebpageUrl = { url };
  console.log('Commencing url trasmission based on this data', urlObject);

  const publicProject = publicProjectId;
  console.log('Publishing to this project topic', publicProject);

  // Target topic in the PubSub (must add this project's service account to target project)
  const topic = pubSub.topic(`projects/${publicProject}/topics/${PublicFunctionNames.SAVE_WEBPAGE_TO_CACHE_TOPIC}`);

  const topicPublishRes = await topic.publishJSON(urlObject)
    .catch(err => {
      console.log('Publish to topic failed', err);
      return err;
    });
  console.log('Res from topic publish', topicPublishRes);

  return topicPublishRes;
}



/////// DEPLOYABLE FUNCTIONS ///////

// A cron job triggers this function, which sends an array of individual transmissions of urls to get updated asynchronously
export const transmitWebpageUrlsToSsr = functions.https.onRequest( async (req, res ) => {
  console.log('Update web cache request received with these headers', req.headers);

  if (req.headers['user-agent'] !== 'Google-Cloud-Scheduler') {
    console.log('Invalid request, ending operation');
    return;
  }

  const postCollectionSnapshot: FirebaseFirestore.QuerySnapshot = await db.collection(SharedCollectionPaths.POSTS).get()
  .catch(error => {
    console.log('Error fetching post collection', error)
    return error;
  });
  const blogSlugWithSlashPrefix = PublicAppRoutes.BLOG;
  const postUrlArray: string[] = postCollectionSnapshot.docs.map(doc => {
    const post: Post = doc.data() as Post;
    const postSlug: string = convertToFriendlyUrlFormat(post.title);
    const postUrl: string = `https://${appUrl}${blogSlugWithSlashPrefix}/${post.id}/${postSlug}`;
    return postUrl;
  });

  const productCollectionSnapshot: FirebaseFirestore.QuerySnapshot = await db.collection(SharedCollectionPaths.PRODUCTS).get()
  .catch(error => {
    console.log('Error fetching product collection', error)
    return error;
  });
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
    await publishUrltoSsrTopic(url)
      .catch(error => {
        console.log('Error transmitting subscriber', error);
        return error;
      });
  })

  const transmissionResponse = await Promise.all(transmitCacheRequests)
    .catch(error => console.log('Error in email record group promise', error));
  
  console.log('All cache update requests sent', res);
  return res.status(200).send(transmissionResponse);
})