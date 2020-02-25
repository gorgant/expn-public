import * as https from 'https';
import { PodcastPaths } from '../../../shared-models/podcast/podcast-paths.model';
import * as xml2js from 'xml2js'; // Also requires stream and timers packages
import * as functions from 'firebase-functions';
import { publicFirestore } from '../config/db-config';
import { PublicCollectionPaths, SharedCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { PodcastContainer } from '../../../shared-models/podcast/podcast-container.model';
import { PodcastEpisode } from '../../../shared-models/podcast/podcast-episode.model';
import { convertHoursMinSecToMill, convertToFriendlyUrlFormat, createOrReverseFirebaseSafeUrl, catchErrors } from '../config/global-helpers';
import { now } from 'moment';
import { Post } from '../../../shared-models/posts/post.model';

const db = publicFirestore;

const fetchBlogPostIdAndHandle = async (episodeUrl: string) => {
  const postsCollectionRef = db.collection(SharedCollectionPaths.POSTS);
  const matchingPostQuerySnapshot = await postsCollectionRef.where('podcastEpisodeUrl', '==', episodeUrl).get()
    .catch(err => {console.log(`Failed to fetch podcast episode from public database:`, err); return err;});
  
  // Handle situation where no matching post is found
  if (matchingPostQuerySnapshot.empty) {
    console.log('No matching post found for this episodeUrl', episodeUrl);
    return;
  }

  const matchingPost = matchingPostQuerySnapshot.docs[0].data() as Post; // Should only be one matching item
  const postId = matchingPost.id;
  const postHandle = convertToFriendlyUrlFormat(matchingPost.title);

  return {postId, postHandle};
}

// Fetch podcast feed data from Soundcloud
const fetchPodcastFeed = async () => {

  const requestUrl = PodcastPaths.EXPLEARNING_RSS_FEED;

  const requestPromise = new Promise<{podcast: PodcastContainer, episodes: PodcastEpisode[]}>(async (resolve, reject) => {

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
          console.log('About to parse full data', fullData);
          xml2js.parseString(fullData, (err, result) => {
            resolv(result);
          });
        });

        const rawJson: any = await parsedXmlPromise;
        console.log('Processing this raw json', rawJson);
        
        // Parse Podcast Container
        const podcastObject = rawJson.rss.channel[0];
        const podcastRssUrl = podcastObject['atom:link'][0].$.href as string;
        const podcastId = podcastRssUrl.split('users:')[1].split('/')[0]; // May change if RSS feed link changes
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

        // Parse Podcast Episodes
        const rawEpisodeArray = podcastObject.item as any[];

        const podcastEpisodeArrayPromise = rawEpisodeArray.map(async rawEpisode => {
          
          const episodeUrl = rawEpisode.link[0];
          const episodeId = createOrReverseFirebaseSafeUrl(episodeUrl);
          const episodeGuid = (rawEpisode.guid[0]._ as string).split('tracks/')[1];
          const episodeTitle = rawEpisode.title[0];
          const episodePubDate = Date.parse(rawEpisode.pubDate[0]);
          const episodeDuration = convertHoursMinSecToMill(rawEpisode['itunes:duration'][0]);
          const episodeAuthor = rawEpisode['itunes:author'][0];
          const episodeDescription = rawEpisode.description[0];
          const episodeImageUrl = rawEpisode['itunes:image'][0].$.href;
          let episodeBlogPostId = '';
          let episodeBlogPostUrlHandle = '';
          
          const blogPostData = await fetchBlogPostIdAndHandle(episodeUrl)
            .catch(err => {console.log(`Failed to fetch blog post id and handle:`, err); return err;});
          
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
            blogPostId: episodeBlogPostId,
            blogPostUrlHandle: episodeBlogPostUrlHandle
          }

          return podcastEpisode;
        })

        const podcastEpisodeArray = await Promise.all(podcastEpisodeArrayPromise)
          .catch(err => {console.log(`Error in group promise forming podcast episode array:`, err); return err;});
        

        resolve({podcast, episodes: podcastEpisodeArray});
      })
    });
    
  
    req.on('error', (e) => {
      console.log('Error with request', e);
      reject(e);
    });
    req.end();
  });

  return requestPromise;
}

// Cache the podcast along with the episodes as a subcollection of the podcast
const cachePodcastFeed = async (podcast: PodcastContainer, episodes: PodcastEpisode[]) => {

  const podcastDocRef = db.collection(PublicCollectionPaths.PODCAST_FEED_CACHE).doc(podcast.id);
  const episodeCollectionRef = podcastDocRef.collection(PublicCollectionPaths.PODCAST_FEED_EPISODES);

  // Cache the podcast
  const cachPodcastRes = await podcastDocRef.set(podcast)
    .catch(err => {console.log(`Error setting podcast in public database:`, err); return err;});
  console.log('Podcast updated');

  // Collect the array of episode cache requests
  const cachEpisodesRequests = episodes.map( async (episode) => {
    const episodeFbRes = await episodeCollectionRef.doc(episode.id).set(episode)
      .catch(err => {console.log(`Error setting podcast episode in public database:`, err); return err;});
    console.log('Episode cached');
    return episodeFbRes;
  })

  // Cache the episodes
  const cacheEpisodesResponse = await Promise.all(cachEpisodesRequests)
    .catch(err => {console.log(`Error in group promise setting episodes:`, err); return err;});
  
  return cachPodcastRes && cacheEpisodesResponse;
  
}

const executeActions = async (): Promise<PodcastContainer> => {
  const {podcast, episodes}: {podcast: PodcastContainer, episodes: PodcastEpisode[]} = await fetchPodcastFeed()
  .catch(err => {console.log(`Error fetching podcast feed:`, err); return err;});
  console.log(`Fetched podcast feed with ${episodes.length} episodes`);

  const fbCacheUpdate = await cachePodcastFeed(podcast, episodes)
    .catch(err => {console.log(`Error caching podcast feed:`, err); return err;});
  console.log('Podcast caching complete', fbCacheUpdate);
  
  return podcast;
}

/////// DEPLOYABLE FUNCTIONS ///////

// This fires every day based on chron job
export const updatePodcastFeedCache = functions.https.onRequest( async (req, resp) => {
  console.log('Get podcast feed request detected with these headers', req.headers);

  // Verify request is from chron job
  if (req.headers['user-agent'] !== 'Google-Cloud-Scheduler') {
    console.log('Invalid request, ending operation');
    return;
  }

  const podcast: PodcastContainer = await catchErrors(executeActions());

  
  return resp.status(200).send(podcast);
});