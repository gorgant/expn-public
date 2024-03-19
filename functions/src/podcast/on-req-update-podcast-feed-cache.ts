import { publicFirestore, getAdminFirestoreWithPublicCreds } from '../config/db-config';
import { SharedCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths.model';
import { PodcastContainer } from '../../../shared-models/podcast/podcast-container.model';
import { PodcastEpisode, PodcastEpisodeKeys } from '../../../shared-models/podcast/podcast-episode.model';
import { convertHHMMSSToMillis, convertToFriendlyUrlFormat, createOrReverseFirebaseSafeUrl, validateRequestToken } from '../config/global-helpers';
import { Post, PostKeys } from '../../../shared-models/posts/post.model';
import { PODCAST_PATHS, PodcastVars } from '../../../shared-models/podcast/podcast-vars.model';
import { HttpsError, HttpsOptions, onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import axios, { AxiosRequestConfig } from 'axios';
import { parseStringPromise } from 'xml2js';
import { Timestamp } from '@google-cloud/firestore';
import { cloudSchedulerServiceAccountSecret } from '../config/api-key-config';
import { SecretsManagerKeyNames } from '../../../shared-models/environments/env-vars.model';

const fetchBlogPostIdAndHandle = async (episodeUrl: string) => {
  const postsCollectionRef = publicFirestore.collection(SharedCollectionPaths.POSTS);

  // Check against the old Anchor URL first since there are more of these, ensures backwards compatibility with the old Anchor url RSS feed format (they may never change this, check from time to time)
  const oldAnchorUrlMatchingPostQuerySnapshot = await postsCollectionRef.where(`${[PostKeys.PODCAST_ANCHOR_RSS_FEED_URL]}`, '==', episodeUrl).get()
    .catch(err => {logger.log(`Failed to fetch podcast episode using new spotify url from public database:`, err); throw new HttpsError('internal', err);});

  let newSpotifyUrlMatchingPostQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

  // If a match there doesn't exist, check against the new spotify url, do this second because there are fewer of these
  if (oldAnchorUrlMatchingPostQuerySnapshot.empty) {
    newSpotifyUrlMatchingPostQuerySnapshot = await postsCollectionRef.where(`${[PostKeys.PODCAST_EPISODE_URL]}`, '==', episodeUrl).get()
      .catch(err => {logger.log(`Failed to fetch podcast episode from public database using old anchor url:`, err); throw new HttpsError('internal', err);});
      
      // Handle situation where no matching post is found with either the new or old url
      if (newSpotifyUrlMatchingPostQuerySnapshot.empty) {
        // logger.log('No matching post found for this episodeUrl using either the old anchor or new spotify URL', episodeUrl);
        return;
      }
  }

  const postUsingOldAnchorUrl = !oldAnchorUrlMatchingPostQuerySnapshot.empty ? oldAnchorUrlMatchingPostQuerySnapshot.docs[0].data() as Post : undefined;
  const postUsingNewSpotifyrUrl = oldAnchorUrlMatchingPostQuerySnapshot.empty ? newSpotifyUrlMatchingPostQuerySnapshot!.docs[0].data() as Post : undefined; // Using the override here bc existence confirmed in if statement above

  const matchingPost = postUsingOldAnchorUrl || postUsingNewSpotifyrUrl;
  
  // This check shouldn't really be necessary bc either one or the other will have a value
  if (!matchingPost) {
    logger.log('Error retreiving matching post from query snapshot', episodeUrl);
    return;
  }
  
  const postId = matchingPost[PostKeys.ID];
  const postHandle = convertToFriendlyUrlFormat(matchingPost[PostKeys.TITLE]);

  return {postId, postHandle};
}

// Convert a raw RSS Json object to usable objects
const convertRawRssJsonToPodcastObjects = async (rawJson: any): Promise<{podcastContainer: PodcastContainer, podcastEpisodes: PodcastEpisode[]}> => {
  
  // Parse Podcast Container
  const podcastObject = rawJson.rss.channel[0];
  const podcastRssUrl = podcastObject['atom:link'][0].$.href as string;
  const podcastId = podcastRssUrl.split(PodcastVars.PODCAST_ID_SPLIT_CODE)[1].split('/')[0]; // May change if RSS feed link changes
  const podcastTitle = podcastObject.title[0];
  const podcastDescription = podcastObject.description[0];
  const podcastImageUrl = podcastObject.image[0].url[0];
  const authorWebsite = podcastObject.link[0];

  const podcastContainer: PodcastContainer = {
    id: podcastId,
    rssUrl: podcastRssUrl,
    title: podcastTitle,
    description: podcastDescription,
    imageUrl: podcastImageUrl,
    authorWebsite,
    lastModifiedTimestamp: Timestamp.now() as any
  }

  logger.log('Created this podcastContainer', podcastContainer);

  interface RawEpisode {
    link: any[],
    guid: any[],
    title: any[],
    pubDate: any[],
    'itunes:duration': any[],
    'dc:creator': any[],
    description: any[],
    'itunes:image': any[]
  }

  // Parse Podcast Episodes
  const rawEpisodeArray = podcastObject.item as RawEpisode[];

  const podcastEpisodeArrayPromise = rawEpisodeArray.map(async rawEpisode => {

    const episodeUrl = rawEpisode.link[0];
    const episodeId = createOrReverseFirebaseSafeUrl(episodeUrl.split('/').pop().toLowerCase());
    const episodeGuid = rawEpisode.guid[0];
    const episodeTitle = rawEpisode.title[0];
    const episodePubDate = Timestamp.fromMillis(Date.parse(rawEpisode.pubDate[0])) as any;
    const episodeDuration = convertHHMMSSToMillis(rawEpisode['itunes:duration'][0]);;
    const episodeAuthor = rawEpisode['dc:creator'][0];
    const episodeDescription = rawEpisode.description[0];
    const episodeImageUrl = rawEpisode['itunes:image'][0].$.href;
    let episodeBlogPostId = '';
    let episodeBlogPostUrlHandle = '';
    
    const blogPostData = await fetchBlogPostIdAndHandle(episodeUrl)
      .catch(err => {logger.log(`Failed to fetch blog post id and handle:`, err); throw new HttpsError('internal', err);});
    
    if (blogPostData) {
      episodeBlogPostId = blogPostData.postId;
      episodeBlogPostUrlHandle = blogPostData.postHandle;
    }

    const podcastEpisode: PodcastEpisode = {
      [PodcastEpisodeKeys.AUTHOR]: episodeAuthor,
      [PodcastEpisodeKeys.BLOG_POST_ID]:episodeBlogPostId,
      [PodcastEpisodeKeys.BLOG_POST_URL_HANDLE]: episodeBlogPostUrlHandle,
      [PodcastEpisodeKeys.DESCRIPTION]: episodeDescription,
      [PodcastEpisodeKeys.DURATION]: episodeDuration,
      [PodcastEpisodeKeys.EPISODE_URL]: episodeUrl,
      [PodcastEpisodeKeys.GUID]: episodeGuid,
      [PodcastEpisodeKeys.ID]: episodeId,
      [PodcastEpisodeKeys.IMAGE_URL]: episodeImageUrl,
      [PodcastEpisodeKeys.LAST_MODIFIED_TIMESTAMP]: Timestamp.now() as any,
      [PodcastEpisodeKeys.PUBLISHED_TIMESTAMP]: episodePubDate,
      [PodcastEpisodeKeys.TITLE]: episodeTitle,
    }

    return podcastEpisode;
  })

  const podcastEpisodeArray = await Promise.all(podcastEpisodeArrayPromise);

  // Only include episodes that are referenced in a blog post
  const filteredPodcastEpisodeArray = podcastEpisodeArray.filter((episode) => episode.blogPostUrlHandle.length > 0);

  return {podcastContainer, podcastEpisodes: filteredPodcastEpisodeArray}
}

// Fetch podcast feed data from Soundcloud
const processPodcastFeed = async (): Promise<{podcastContainer: PodcastContainer, podcastEpisodes: PodcastEpisode[]}> => {

  const podcastRssUrl = PODCAST_PATHS.expn.rssFeedPath;
  logger.log(`Requesting data from this RSS feed`, podcastRssUrl);

  // Building this just for logging purposes, we don't use it since we don't use the helper below because the helper doesn't work with the XML return format
  const requestOptions: AxiosRequestConfig = {
    method: 'GET',
    url: podcastRssUrl,
  };
  logger.log('submitting fetchPodcastFeed with these options', requestOptions);

  // Per the above, not using the helper here since we need to format XML
  const rssFeedResponse = await axios.get(podcastRssUrl, {
      responseType: 'text'
    })
    .catch(err => {logger.log(`Error with Youtube API request:`, err); throw new HttpsError('internal', err);});

  const rawRssJson: any = await parseStringPromise(rssFeedResponse.data);
  logger.log('Processing this raw json', rawRssJson);

  return convertRawRssJsonToPodcastObjects(rawRssJson);

}

const batchCommitPodcastEpisodesToDatabase = async (podcastEpisodes: PodcastEpisode[], publicPodcastDocRef: FirebaseFirestore.DocumentReference, adminPodcastDocRef: FirebaseFirestore.DocumentReference) => {
  const adminEpisodeCollectionRef = adminPodcastDocRef.collection(SharedCollectionPaths.PODCAST_EPISODES);
  const publicEpisodeCollectionRef = publicPodcastDocRef.collection(SharedCollectionPaths.PODCAST_EPISODES);

  let adminWriteBatch = getAdminFirestoreWithPublicCreds().batch();
  let publicWriteBatch = publicFirestore.batch();
  let adminOperationCount = 0;
  let publicOperationCount = 0;

  for (const episode of podcastEpisodes) {
    const adminPodcastEpisodeRef = adminEpisodeCollectionRef.doc(episode.id);
    const publicPodcastEpisodeRef = publicEpisodeCollectionRef.doc(episode.id);

    adminWriteBatch.set(adminPodcastEpisodeRef, episode);
    adminOperationCount++;

    publicWriteBatch.set(publicPodcastEpisodeRef, episode);
    publicOperationCount++;

    // Firestore batch limit is 500 operations per batch
    // Commit the existing batch and create a new batch instance (the loop will continue with that new batch instance)
    if (adminOperationCount === 490) {
      await adminWriteBatch.commit()
        .catch(err => {logger.log(`Error writing batch to admin database:`, err); throw new HttpsError('internal', err);});

      adminWriteBatch = getAdminFirestoreWithPublicCreds().batch();
      adminOperationCount = 0;
    }

    if (publicOperationCount === 490) {
      await publicWriteBatch.commit()
        .catch(err => {logger.log(`Error writing batch to public database:`, err); throw new HttpsError('internal', err);});

      publicWriteBatch = publicFirestore.batch();
      publicOperationCount = 0;
    }
  }

  if (adminOperationCount > 0) {
    await adminWriteBatch.commit()
      .catch(err => {logger.log(`Error writing batch to admin database:`, err); throw new HttpsError('internal', err);});
  }

  if (publicOperationCount > 0) {
    await publicWriteBatch.commit()
      .catch(err => {logger.log(`Error writing batch to public database:`, err); throw new HttpsError('internal', err);});
  }

  logger.log(`Set ${podcastEpisodes.length} podcastEpisodes in public and admin databases`);
}


// Cache the podcast along with the episodes as a subcollection of the podcast
const updatePodcastInDatabase = async (podcastContainer: PodcastContainer, podcastEpisodes: PodcastEpisode[]) => {

  const publicPodcastContainerRef = publicFirestore.collection(SharedCollectionPaths.PODCAST_CONTAINERS).doc(podcastContainer.id);
  const adminFirestoreWithPublicCreds = getAdminFirestoreWithPublicCreds();
  const adminPodcastContainerRef = adminFirestoreWithPublicCreds.collection(SharedCollectionPaths.PODCAST_CONTAINERS).doc(podcastContainer.id);

  // Cache the podcastContainer
  await publicPodcastContainerRef.set(podcastContainer)
    .catch(err => {logger.log(`Error setting podcast in public database:`, err); throw new HttpsError('internal', err);});
  
  await adminPodcastContainerRef.set(podcastContainer)
    .catch(err => {logger.log(`Error setting podcast in admin database:`, err); throw new HttpsError('internal', err);});

  // Cache the podcastEpisodes within the podcastContainers
  await batchCommitPodcastEpisodesToDatabase(podcastEpisodes, publicPodcastContainerRef, adminPodcastContainerRef);
}

const executeActions = async (): Promise<PodcastContainer> => {
  const {podcastContainer, podcastEpisodes}: {podcastContainer: PodcastContainer, podcastEpisodes: PodcastEpisode[]} = await processPodcastFeed();
  logger.log(`Fetched podcast feed with ${podcastEpisodes.length} podcastEpisodes`);

  await updatePodcastInDatabase(podcastContainer, podcastEpisodes);
  logger.log('Podcast caching complete');
  
  return podcastContainer;
}

/////// DEPLOYABLE FUNCTIONS ///////

const httpOptions: HttpsOptions = {
  secrets: [
    SecretsManagerKeyNames.CLOUD_SCHEDULER_SERVICE_ACCOUNT_EMAIL,
    SecretsManagerKeyNames.ALTERNATE_PROJECT_SERVICE_ACCOUNT_CREDS
  ]
};

// This fires every day based on chron job
export const onReqUpdatePodcastFeedCache = onRequest(httpOptions, async (req, res) => {
  logger.log('onReqUpdatePodcastFeedCache detected with these headers', req.headers);

  const expectedAudience = cloudSchedulerServiceAccountSecret.value();
  
  const isValid = await validateRequestToken(req, res, expectedAudience);
  
  if (!isValid) {
    logger.log('Request verification failed, terminating function');
    return;
  }

  const podcast: PodcastContainer = await executeActions();

  res.status(200).send(podcast);
});