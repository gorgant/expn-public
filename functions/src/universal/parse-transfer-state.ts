import { EnvironmentTypes, PRODUCTION_APPS, SANDBOX_APPS } from "../../../shared-models/environments/env-vars.model";
import { currentEnvironmentType } from "../config/environments-config";
import { PublicAppRoutes } from "../../../shared-models/routes-and-paths/app-routes.model";
import { TransferStateKeys } from '../../../shared-models/ssr/ssr-vars';
import { BlogIndexPostRef } from "../../../shared-models/posts/blog-index-post-ref.model";
import { PodcastEpisode } from "../../../shared-models/podcast/podcast-episode.model";

// import { JSDOM } from 'jsdom';
// import jsdom = require('jsdom');
// const JSDOM = jsdom.JSDOM;
// import * as JSDOM from 'jsdom';

// import { DOMParser } from 'xmldom';

const unescapeHtml = (text: string) => {
  const unescapedText: any = {
      '&a;': '&',
      '&q;': '"',
      '&s;': '\'',
      '&l;': '<',
      '&g;': '>',
  };
  return text.replace(/&[^;]+;/g, (s) => unescapedText[s]);
}

// Locate the transfer state data in the HTML string and convert it to an object
export const parseTransferState = (htmlString: string, routeType: PublicAppRoutes): BlogIndexPostRef[] | PodcastEpisode[] => {

  console.log('Attempting to parse html doc');

  const appId: string = currentEnvironmentType === EnvironmentTypes.PRODUCTION ? PRODUCTION_APPS.explearningPublicApp.projectId : SANDBOX_APPS.explearningPublicApp.projectId;

  const scriptId = `${appId}-state`;

  
  console.log(`Parsing html doc using this script tag ${scriptId}`)

  const openingString = `${scriptId}" type="application/json">`;
  const closingString = `</script>`;

  const regex = new RegExp(`${openingString}(.*?)${closingString}`);

  console.log(`Using this regex to search: ${regex}`);

  try {
    const scriptContent = (htmlString.match(regex) as RegExpMatchArray)[1];

    console.log(`Found this script content`, scriptContent);

    let initialState = {};
    if (scriptContent.length > 0) {
        try {
            initialState = JSON.parse(unescapeHtml(scriptContent));
            
        }
        catch (e) {
            console.warn('Exception while restoring TransferState for app ' + appId, e);
        }
    }

    let dataKey;
    let dataArray;

    // Return the data specific to the data key
    switch (routeType) {
      case PublicAppRoutes.BLOG:
        dataKey = TransferStateKeys.BLOG_INDEX_KEY;
        dataArray = (initialState as any)[dataKey] as BlogIndexPostRef[];
        console.log(`Found this data in blog post`, dataArray);
        return dataArray;
      case PublicAppRoutes.PODCAST:
        dataKey = TransferStateKeys.ALL_PODCAST_EPISODES_KEY;
        console.log(`Found this data in podcast`, dataArray);
        dataArray = (initialState as any)[dataKey] as PodcastEpisode[];
        return dataArray;
      default:
        dataKey = '';
        console.log(`No data found in html`, dataArray);
        return [];
    }

  } catch (e) {
    console.log(`Error parsing HTML for script content:`, e);
    return e;
  }
  

  
}