import * as https from 'https';
import { PodcastPaths } from '../../../shared-models/podcast/podcast-paths.model';
import * as xml2js from 'xml2js'; // Also requires stream and timers packages
import * as functions from 'firebase-functions';
import { publicFirestore } from '../db';
import { PublicCollectionPaths } from '../../../shared-models/routes-and-paths/fb-collection-paths';
import { PodcastContainer } from '../../../shared-models/podcast/podcast-container.model';
import { PodcastEpisode } from '../../../shared-models/podcast/podcast-episode.model';
import { createOrReverseFirebaseSafeUrl, convertHoursMinSecToMill } from '../global-helpers';
import { now } from 'moment';

const db = publicFirestore;

// Fetch aqi data for a specific city
const fetchPodcastFeed = async() => {

  const requestUrl = PodcastPaths.EXPLEARNING_PRIMARY;

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
        const podcastRssUrl = podcastObject['atom:link'][0].$.href;
        const podcastId = createOrReverseFirebaseSafeUrl(podcastRssUrl);
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

        const podcastEpisodeArray = rawEpisodeArray.map(rawEpisode => {

          const episodeUrl = rawEpisode.link[0];
          const episodeId = createOrReverseFirebaseSafeUrl(episodeUrl);
          const episodeTitle = rawEpisode.title[0];
          const episodePubDate = Date.parse(rawEpisode.pubDate[0]);
          const episodeDuration = convertHoursMinSecToMill(rawEpisode['itunes:duration'][0]);
          const episodeAuthor = rawEpisode['itunes:author'][0];
          const episodeDescription = rawEpisode.description[0];
          const episodeImageUrl = rawEpisode['itunes:image'][0].$.href;

          const podcastEpisode: PodcastEpisode = {
            id: episodeId,
            title: episodeTitle,
            pubDate: episodePubDate,
            episodeUrl,
            duration: episodeDuration,
            author: episodeAuthor,
            description: episodeDescription,
            imageUrl: episodeImageUrl,
            modifiedDate: now()
          }

          return podcastEpisode;
        })

        resolve({podcast, episodes: podcastEpisodeArray});
      })
    });
    
  
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });

  return requestPromise;
}

// Cache the podcast along with the episodes as a subcollection of the podcast
const cachePodcastFeed = async (podcast: PodcastContainer, episodes: PodcastEpisode[]) => {

  const podcastColletionRef = db.collection(PublicCollectionPaths.PODCAST_FEED_CACHE).doc(podcast.id);
  const episodeCollectionRef = podcastColletionRef.collection(PublicCollectionPaths.PODCAST_FEED_EPISODES);

  // Cache the podcast
  const cachPodcastRes = await podcastColletionRef.set(podcast)
    .catch(error => {
      console.log('Error connecting to firebase', error);
      return error;
    });
    console.log('Podcast cached');

  // Collect the array of episode cache requests
  const cachEpisodesRequests = episodes.map( async (episode) => {
    const episodeFbRes = await episodeCollectionRef.doc(episode.id).set(episode)
      .catch(error => {
        console.log('Error connecting to firebase', error);
        return error;
      });
    console.log('Podcast cached');
    return episodeFbRes;
  })

  // Cache the episodes
  const cacheEpisodesResponse = await Promise.all(cachEpisodesRequests)
    .catch(error => console.log('Error in episodes group promise', error));
  
  return cachPodcastRes && cacheEpisodesResponse;
  
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

  const {podcast, episodes} = await fetchPodcastFeed()
    .catch(err => {
      console.log('Error fetching feed', err);
      return err;
    });
  
  const fbCacheUpdate = await cachePodcastFeed(podcast, episodes)
    .catch(err => {
      console.log('Error caching feed', err);
      return err;
    });

  console.log('Podcast caching complete', fbCacheUpdate);
  return resp.status(200).send(podcast);
});