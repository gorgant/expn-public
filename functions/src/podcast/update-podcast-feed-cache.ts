import * as https from 'https';
import * as xml2js from 'xml2js'; // Also requires stream and timers packages
import * as functions from 'firebase-functions';
import { publicFirestore, adminFirestore } from '../config/db-config';
import { SharedCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { PodcastContainer } from '../../../shared-models/podcast/podcast-container.model';
import { PodcastEpisode } from '../../../shared-models/podcast/podcast-episode.model';
import { convertToFriendlyUrlFormat, createOrReverseFirebaseSafeUrl } from '../config/global-helpers';
import { now } from 'moment';
import { Post, PostKeys } from '../../../shared-models/posts/post.model';
import { PODCAST_PATHS } from '../../../shared-models/podcast/podcast-vars.model';

const publicDb = publicFirestore;
const adminDb = adminFirestore;

const fetchBlogPostIdAndHandle = async (episodeUrl: string) => {
  const postsCollectionRef = publicDb.collection(SharedCollectionPaths.POSTS);

  // Check against the old Anchor URL first since there are more of these, ensures backwards compatibility with the old Anchor url RSS feed format (they may never change this, check from time to time)
  const oldAnchorUrlMatchingPostQuerySnapshot = await postsCollectionRef.where(`${[PostKeys.PODCAST_ANCHOR_RSS_FEED_URL]}`, '==', episodeUrl).get()
    .catch(err => {functions.logger.log(`Failed to fetch podcast episode using new spotify url from public database:`, err); throw new functions.https.HttpsError('internal', err);});

  let newSpotifyUrlMatchingPostQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

  // If a match there doesn't exist, check against the new spotify url, do this second because there are fewer of these
  if (oldAnchorUrlMatchingPostQuerySnapshot.empty) {
    newSpotifyUrlMatchingPostQuerySnapshot = await postsCollectionRef.where(`${[PostKeys.PODCAST_EPISODE_URL]}`, '==', episodeUrl).get()
      .catch(err => {functions.logger.log(`Failed to fetch podcast episode from public database using old anchor url:`, err); throw new functions.https.HttpsError('internal', err);});
      
      // Handle situation where no matching post is found with either the new or old url
      if (newSpotifyUrlMatchingPostQuerySnapshot.empty) {
        functions.logger.log('No matching post found for this episodeUrl using either the old anchor or new spotify URL', episodeUrl);
        return;
      }
  }

  const postUsingOldAnchorUrl = !oldAnchorUrlMatchingPostQuerySnapshot.empty ? oldAnchorUrlMatchingPostQuerySnapshot.docs[0].data() as Post : undefined;
  const postUsingNewSpotifyrUrl = oldAnchorUrlMatchingPostQuerySnapshot.empty ? newSpotifyUrlMatchingPostQuerySnapshot!.docs[0].data() as Post : undefined; // Using the override here bc existence confirmed in if statement above

  const matchingPost = postUsingOldAnchorUrl || postUsingNewSpotifyrUrl;
  
  // This check shouldn't really be necessary bc either on or the other will have a value
  if (!matchingPost) {
    functions.logger.log('Error retreiving matching post from query snapshot', episodeUrl);
    return;
  }
  
  const postId = matchingPost.id;
  const postHandle = convertToFriendlyUrlFormat(matchingPost.title);

  return {postId, postHandle};
}

// Fetch podcast feed data from Soundcloud
const fetchPodcastFeed = async () => {

  const requestUrl = PODCAST_PATHS.expn.rssFeedPath;

  const requestPromise = new Promise<{podcast: PodcastContainer, episodes: PodcastEpisode[]}>(async (resolve, reject) => {

    functions.logger.log(`Requesting data from this RSS feed`, requestUrl);

    const req = https.request(requestUrl, (res) => {
      let fullData = '';
      
      // Build fullData string (this is called multiple times)
      res.on('data', async (d) => {
        const dataBuffer = d as Buffer;
        const stringData = dataBuffer.toString('utf8');
        fullData += stringData;
      });

      // Once the full data has been loaded, parse it
      res.on('end', async () => {
        const parsedXmlPromise = new Promise<{}>((resolv, rejec) => {
          functions.logger.log('About to parse full data', fullData);
          xml2js.parseString(fullData, (err, result) => {
            resolv(result);
          });
        });

        const rawJson: any = await parsedXmlPromise;
        functions.logger.log('Processing this raw json', rawJson);
        
        // Parse Podcast Container
        const podcastObject = rawJson.rss.channel[0];
        const podcastRssUrl = podcastObject['atom:link'][0].$.href as string;
        const podcastId = podcastRssUrl.split('anchor.fm/s/')[1].split('/')[0]; // May change if RSS feed link changes
        const podcastTitle = podcastObject.title[0];
        const podcastDescription = podcastObject.description[0];
        const podcastImageUrl = podcastObject.image[0].url[0];
        const authorWebsite = podcastObject.link[0];

        const podcast: PodcastContainer = {
          id: podcastId,
          rssUrl: podcastRssUrl,
          title: podcastTitle,
          description: podcastDescription,
          imageUrl: podcastImageUrl,
          authorWebsite,
          modifiedDate: now()
        }

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
          const episodePubDate = Date.parse(rawEpisode.pubDate[0]);
          const episodeDuration = rawEpisode['itunes:duration'][0] * 1000; // convert seconds to ms
          const episodeAuthor = rawEpisode['dc:creator'][0];
          const episodeDescription = rawEpisode.description[0];
          const episodeImageUrl = rawEpisode['itunes:image'][0].$.href;
          let episodeBlogPostId = '';
          let episodeBlogPostUrlHandle = '';
          
          const blogPostData = await fetchBlogPostIdAndHandle(episodeUrl)
            .catch(err => {functions.logger.log(`Failed to fetch blog post id and handle:`, err); throw new functions.https.HttpsError('internal', err);});
          
          if (blogPostData) {
            episodeBlogPostId = blogPostData.postId;
            episodeBlogPostUrlHandle = blogPostData.postHandle;
          }

          const podcastEpisode: PodcastEpisode = {
            id: episodeId,
            guid: episodeGuid,
            title: episodeTitle,
            pubDate: episodePubDate,
            episodeUrl,
            duration: episodeDuration,
            author: episodeAuthor,
            description: episodeDescription,
            imageUrl: episodeImageUrl,
            modifiedDate: now(),
            blogPostId:episodeBlogPostId,
            blogPostUrlHandle: episodeBlogPostUrlHandle
          }

          return podcastEpisode;
        })

        const podcastEpisodeArray = await Promise.all(podcastEpisodeArrayPromise);

        // Only include episodes that are referenced in a blog post
        const filteredPodcastEpisodeArray = podcastEpisodeArray.filter((episode) => episode.blogPostUrlHandle.length > 0);
        
        resolve({podcast, episodes: filteredPodcastEpisodeArray});
      })
    });
    
  
    req.on('error', (e) => {
      functions.logger.log('Error with request', e);
      reject(e);
    });
    req.end();
  });

  return requestPromise;
}

let itemsProcessedCount = 0; // Keeps track of episodes cached between loops
let loopCount = 0; // Prevents infinite looping in case of error
const batchCacheEpisodes = async (episodes: PodcastEpisode[], publicPodcastDocRef: FirebaseFirestore.DocumentReference, adminPodcastDocRef: FirebaseFirestore.DocumentReference) => {
  const publicEpisodeCollectionRef = publicPodcastDocRef.collection(SharedCollectionPaths.PODCAST_FEED_EPISODES);
  const adminEpisodeCollectionRef = adminPodcastDocRef.collection(SharedCollectionPaths.PODCAST_FEED_EPISODES);
  
  const remainingEpisodesToCache = episodes.slice(itemsProcessedCount);
  
  const publicBatch = publicDb.batch();
  const adminBatch = adminDb.batch();
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
    .catch(err => {functions.logger.log(`Error with batch creation:`, err); throw new functions.https.HttpsError('internal', err);});
  const adminBatchCreate = await adminBatch.commit()
    .catch(err => {functions.logger.log(`Error with batch creation:`, err); throw new functions.https.HttpsError('internal', err);});

  functions.logger.log(`Batch created ${publicBatchCreate.length} items on public and ${adminBatchCreate.length} on admin`);
  itemsProcessedCount += batchSize; // Update global variable to keep track of remaining episodes to cache
  loopCount++;
}

// Cache the podcast along with the episodes as a subcollection of the podcast
const cachePodcastFeed = async (podcast: PodcastContainer, episodes: PodcastEpisode[]) => {

  itemsProcessedCount = 0; // Initialize at zero (prevents global variable remenant from last function execution)
  loopCount = 0; // Initialize at zero (prevents global variable remenant from last function execution)

  const publicPodcastDocRef = publicDb.collection(SharedCollectionPaths.PODCAST_FEED_CACHE).doc(podcast.id);
  const adminPodcastDocRef = adminDb.collection(SharedCollectionPaths.PODCAST_FEED_CACHE).doc(podcast.id);

  // Cache the podcast
  await publicPodcastDocRef.set(podcast)
    .catch(err => {functions.logger.log(`Error setting podcast in public database:`, err); throw new functions.https.HttpsError('internal', err);});
  functions.logger.log('Podcast updated on public database');
  await adminPodcastDocRef.set(podcast)
    .catch(err => {functions.logger.log(`Error setting podcast in admin database:`, err); throw new functions.https.HttpsError('internal', err);});
  functions.logger.log('Podcast updated on admin database');

  // Cache each episode inside the podcast container
  const totalItemCount = episodes.length;
  while (itemsProcessedCount < totalItemCount && loopCount < 10) {
    await batchCacheEpisodes(episodes, publicPodcastDocRef, adminPodcastDocRef);
    if (itemsProcessedCount < totalItemCount) {
      functions.logger.log(`Repeating batch process: ${itemsProcessedCount} out of ${totalItemCount} items cached`);
    }
  }
}



const executeActions = async (): Promise<PodcastContainer> => {
  const {podcast, episodes}: {podcast: PodcastContainer, episodes: PodcastEpisode[]} = await fetchPodcastFeed();
  functions.logger.log(`Fetched podcast feed with ${episodes.length} episodes`);

  await cachePodcastFeed(podcast, episodes);
  functions.logger.log('Podcast caching complete');
  
  return podcast;
}

/////// DEPLOYABLE FUNCTIONS ///////

// This fires every day based on chron job
export const updatePodcastFeedCache = functions.https.onRequest( async (req, resp) => {
  functions.logger.log('Get podcast feed request detected with these headers', req.headers);

  // Verify request is from chron job
  if (req.headers['user-agent'] !== 'Google-Cloud-Scheduler') {
    functions.logger.log('Invalid request, ending operation');
    return;
  }

  const podcast: PodcastContainer = await executeActions();

  
  resp.status(200).send(podcast);
});