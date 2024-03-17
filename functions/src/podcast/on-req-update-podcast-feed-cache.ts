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

const publicDb = publicFirestore;

const fetchBlogPostIdAndHandle = async (episodeUrl: string) => {
  const postsCollectionRef = publicDb.collection(SharedCollectionPaths.POSTS);

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
const convertRawRssJsonToPodcastObjects = async (rawJson: any): Promise<{podcast: PodcastContainer, episodes: PodcastEpisode[]}> => {
  
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

  return {podcast: podcastContainer, episodes: filteredPodcastEpisodeArray}
}

// Fetch podcast feed data from Soundcloud
const processPodcastFeed = async (): Promise<{podcast: PodcastContainer, episodes: PodcastEpisode[]}> => {

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

let itemsProcessedCount = 0; // Keeps track of episodes cached between loops
let loopCount = 0; // Prevents infinite looping in case of error
const batchCacheEpisodes = async (episodes: PodcastEpisode[], publicPodcastDocRef: FirebaseFirestore.DocumentReference, adminPodcastDocRef: FirebaseFirestore.DocumentReference) => {
  const publicEpisodeCollectionRef = publicPodcastDocRef.collection(SharedCollectionPaths.PODCAST_EPISODES);
  const adminEpisodeCollectionRef = adminPodcastDocRef.collection(SharedCollectionPaths.PODCAST_EPISODES);
  
  const remainingEpisodesToCache = episodes.slice(itemsProcessedCount);
  
  const publicBatch = publicDb.batch();
  const adminFirestoreWithPublicCreds = getAdminFirestoreWithPublicCreds();
  const adminBatch = adminFirestoreWithPublicCreds.batch();
  const maxBatchSize = 450; // Firebase limit is 500
  let batchSize = 0;
  // Loop through array until the max batch size is reached
  for (let i = 0; i < maxBatchSize; i++) {
    // Get the data to upload
    const episode = remainingEpisodesToCache[i];
    if (!episode) {
      break; // Abort loop if end of array reached before batch limit is hit
    }
    // Create a reference to the new doc using the episode id
    const publicDocRef = publicEpisodeCollectionRef.doc(episode.id);
    const adminDocRef = adminEpisodeCollectionRef.doc(episode.id);
    publicBatch.set(publicDocRef, episode);
    adminBatch.set(adminDocRef, episode);
    batchSize = i+1;
  }

  const publicBatchCreate = await publicBatch.commit()
    .catch(err => {logger.log(`Error with batch creation:`, err); throw new HttpsError('internal', err);});
  const adminBatchCreate = await adminBatch.commit()
    .catch(err => {logger.log(`Error with batch creation:`, err); throw new HttpsError('internal', err);});

  logger.log(`Batch created ${publicBatchCreate.length} items on public and ${adminBatchCreate.length} on admin`);
  itemsProcessedCount += batchSize; // Update global variable to keep track of remaining episodes to cache
  loopCount++;
}

// Cache the podcast along with the episodes as a subcollection of the podcast
const updatePodcastInDatabase = async (podcast: PodcastContainer, episodes: PodcastEpisode[]) => {

  itemsProcessedCount = 0; // Initialize at zero (prevents global variable remenant from last function execution)
  loopCount = 0; // Initialize at zero (prevents global variable remenant from last function execution)

  
  const publicPodcastDocRef = publicDb.collection(SharedCollectionPaths.PODCAST_CONTAINERS).doc(podcast.id);
  const adminFirestoreWithPublicCreds = getAdminFirestoreWithPublicCreds();
  const adminPodcastDocRef = adminFirestoreWithPublicCreds.collection(SharedCollectionPaths.PODCAST_CONTAINERS).doc(podcast.id);

  // Cache the podcast
  await publicPodcastDocRef.set(podcast)
    .catch(err => {logger.log(`Error setting podcast in public database:`, err); throw new HttpsError('internal', err);});
  logger.log('Podcast updated on public database');
  await adminPodcastDocRef.set(podcast)
    .catch(err => {logger.log(`Error setting podcast in admin database:`, err); throw new HttpsError('internal', err);});
  logger.log('Podcast updated on admin database');

  // Cache each episode inside the podcast container
  const totalItemCount = episodes.length;
  while (itemsProcessedCount < totalItemCount && loopCount < 10) {
    await batchCacheEpisodes(episodes, publicPodcastDocRef, adminPodcastDocRef);
    if (itemsProcessedCount < totalItemCount) {
      logger.log(`Repeating batch process: ${itemsProcessedCount} out of ${totalItemCount} items cached`);
    }
  }
}

const executeActions = async (): Promise<PodcastContainer> => {
  const {podcast, episodes}: {podcast: PodcastContainer, episodes: PodcastEpisode[]} = await processPodcastFeed();
  logger.log(`Fetched podcast feed with ${episodes.length} episodes`);

  await updatePodcastInDatabase(podcast, episodes);
  logger.log('Podcast caching complete');
  
  return podcast;
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