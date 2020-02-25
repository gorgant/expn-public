import { createOrReverseFirebaseSafeUrl, catchErrors } from "../config/global-helpers";
import { metaTagDefaults } from "../../../shared-models/analytics/metatags.model";
import { Webpage } from "../../../shared-models/ssr/webpage.model";
import { now } from "moment";
import { publicFirestore } from "../config/db-config";
import { PublicCollectionPaths } from "../../../shared-models/routes-and-paths/fb-collection-paths";

const db = publicFirestore;
const charLimit = 700000; // Sets the character limit for a segment (FB max is 1M bytes, which is typically ~1.2x chars)

const updateHtml = (html: string, docTarget: string, textToAdd: string): string => {
  const startIndex = html.indexOf(docTarget) + docTarget.length;
  const updatedHtml = html.slice(0, startIndex) + ` ${textToAdd}` + html.slice(startIndex);
  return updatedHtml;
}

// Applied before storing in database
const tagCacheInHtml = (html: string): string => {
  const docTarget = '<head>';
  const cacheTag = `<meta name="${metaTagDefaults.explearningPublic.metaTagCachedHtml}" content="true">`;
  const updatedHtml = updateHtml(html, docTarget, cacheTag);
  console.log('Marking cache in HTML');
  return updatedHtml;
}

// Applied after retrieving from database
const tagBotInHtml = (html: string): string => {
  const docTarget = '<head>';
  const botTag = `<meta name="${metaTagDefaults.explearningPublic.metaTagIsBot}" content="true">`;
  const updatedHtml = updateHtml(html, docTarget, botTag);
  console.log('Marking bot in HTML');
  return updatedHtml;
}

// Store html in segments (since it exceeded char limit)
const storePageHtmlSegments = async (url: string, userAgent: string, html: string, charLength: number) => {

  const fbSafeUrl: string = createOrReverseFirebaseSafeUrl(url);

  const expires = now() + (1000 * 60 * 60 * 24 * 7);

  const partitions = Math.ceil(charLength/charLimit); // Determine the number of partitions to make

  let subStrIndex = 0; // Segment index
  const htmlSegmentArray: string [] = []; // Segments are stored here

  // Create each segment
  for (let i = 0; i < partitions; i++) {
    const htmlSegment = html.substr(subStrIndex, charLimit);
    htmlSegmentArray.push(htmlSegment);
    subStrIndex = subStrIndex + charLimit;
  }

  const htmlSegmentIds: string[] = []; 

  const webpageArray: Webpage[] = htmlSegmentArray.map((htmlSegment, index) => {
    const docId = `${fbSafeUrl}-partition-${index}`;
    htmlSegmentIds.push(docId); // Store segment ids for easy future retrieval
    const webpage: Webpage = {
      expires, // Set expiry for seven days
      userAgent,
      payload: htmlSegment,
      saved: now(),
      url: createOrReverseFirebaseSafeUrl(fbSafeUrl, true), // Revert to normal url
      segmentId: docId,
      segmentCharLength: htmlSegment.length,
      pageCharLength: charLength
    }
    return webpage;
  })

  // Stores the segmentIdArray for easy retrieval of segments
  const referenceWebpage: Webpage = {
    expires,
    userAgent,
    payload: '',
    saved: now(),
    url: createOrReverseFirebaseSafeUrl(fbSafeUrl, true),
    htmlSegmentIdArray: htmlSegmentIds,
    segmentId: fbSafeUrl,
    pageCharLength: charLength
  };

  webpageArray.push(referenceWebpage); // Add ID reference to the array for upload
  
  // Upload segments to database
  const uploadWebpageSegments = webpageArray.map( async (webpage, index) => {
    await db.collection(PublicCollectionPaths.PUBLIC_SITE_CACHE).doc(webpage.segmentId as string).set(webpage)
      .catch(err => {console.log(`Failed to update webpage on public database:`, err); return err;});
  })

  const uploadResponse = await Promise.all(uploadWebpageSegments)
    .catch(err => {console.log(`Error in group promise uploading webpage segments:`, err); return err;});

  console.log('All blog html segments uploaded');
  return uploadResponse;
}

// Fetch the webpage segments using the ref doc
const retrieveSegmentedWebPageCache = async (segmentRefData: Webpage, isBot: boolean) => {
  
  console.log('Segmented data detected, parsing segments');

  const htmlSegementIdArray: string[] = segmentRefData.htmlSegmentIdArray as string[];
  
  // Unpack the html segments using the array of ids
  const segementPromiseArray = htmlSegementIdArray.map( async (segementId) => {
    const blogSegmentDoc: FirebaseFirestore.DocumentSnapshot = await db.collection(PublicCollectionPaths.PUBLIC_SITE_CACHE).doc(segementId).get()
      .catch(err => {console.log(`Error fetching blog segment:`, err); return err;});
    const segmentData = blogSegmentDoc.data() as Webpage;
    return segmentData.payload;
  });

  const htmlSegementArray = await Promise.all(segementPromiseArray)
    .catch(err => {console.log(`Error in group promise fetching blog segments:`, err); return err;});

  const completeHtml = (htmlSegementArray as string []).join(''); // Combine the segments into a single html string

  const completeWebpage: Webpage = {
    ...segmentRefData,
    payload: completeHtml
  }

  // If a bot is accessing page, indicate that in the html
  if (isBot) {
    completeWebpage.payload = tagBotInHtml(segmentRefData.payload);
  }
  return completeWebpage;
};

// // Returns the byte length of an utf8 string
// // Courtesy of: https://stackoverflow.com/a/23329386/6572208
// const calculateByteLength = (str: string) => {
//   let s = str.length;
//   for (let i=str.length-1; i>=0; i--) {
//     const code = str.charCodeAt(i);
//     if (code > 0x7f && code <= 0x7ff) s++;
//     else if (code > 0x7ff && code <= 0xffff) s+=2;
//     if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
//   }
//   return s;
// }

//// EXPORTED FUNCTIONS ////


// Store cache in Firebase for rapid access
export const storeWebPageCache = async (url: string, userAgent: string, html: string) => {
  
  const fbSafeUrl: string = createOrReverseFirebaseSafeUrl(url);

  let updatedHtml: string;

  updatedHtml = tagCacheInHtml(html); // Add a cache tag to the HTML doc in the head section

  // If char limit exceeded, store as segments and exit function
  const htmlCharLength = updatedHtml.length;
  if (htmlCharLength > charLimit) {
    console.log('Char length exceeded, attempting to store page html segements')
    const segmentedWebpageFbRes = await storePageHtmlSegments(url, userAgent, html, htmlCharLength)
      .catch(err => {console.log(`Error storing html segments:`, err); return err;});
    return segmentedWebpageFbRes;
  }

  // Otherwise, store as a single document
  const webpage: Webpage = {
    expires: now() + (1000 * 60 * 60 * 24 * 7), // Set expiry for seven days
    userAgent,
    payload: updatedHtml,
    saved: now(),
    url: createOrReverseFirebaseSafeUrl(fbSafeUrl, true), // Revert to normal url
    pageCharLength: htmlCharLength
  }
  
  const fbRes = await db.collection(PublicCollectionPaths.PUBLIC_SITE_CACHE).doc(fbSafeUrl).set(webpage)
    .catch(err => {console.log(`Error updating webpage cache on public database:`, err); return err;});
  console.log('Web page cached with this id', webpage.url);
    return fbRes;
}

const executeActions = async (webPageData: Webpage, isBot: boolean): Promise<Webpage> => {
  
  let updatedWebpageData = webPageData;

  // If htmlSegmentIdArray has an item, it is a ref doc with segmented data, so fetch appropriately
  if (webPageData.htmlSegmentIdArray && webPageData.htmlSegmentIdArray.length > 0) {
    updatedWebpageData = await retrieveSegmentedWebPageCache(webPageData, isBot)
      .catch(err => {console.log(`Error retrieving segmented webpage cache:`, err); return err;});
  }
  
  // If a bot is accessing page, indicate that in the html
  if (isBot) {
    updatedWebpageData.payload = tagBotInHtml(webPageData.payload);
  }
  return updatedWebpageData;
}

// Retrieve cached page from Firebase
export const retrieveWebPageCache = async (url: string, isBot: boolean): Promise<Webpage | undefined> => {
  
  const fbSafeUrl = createOrReverseFirebaseSafeUrl(url);
  
  console.log('Attempting to retrieve cached page with id: ', fbSafeUrl);
  const pageDoc: FirebaseFirestore.DocumentSnapshot = await db.collection(PublicCollectionPaths.PUBLIC_SITE_CACHE).doc(fbSafeUrl).get()
    .catch(err => {console.log(`Error fetching webpage doc from public database:`, err); return err;});

  if (!pageDoc.exists) {
    console.log('No cached page found');
    return undefined;
  }
  console.log('Cached page exists');
  const webPageData = pageDoc.data() as Webpage;

  return await catchErrors(executeActions(webPageData, isBot)) as Webpage;
  
}