import * as firebase from 'firebase/app';
import { PublicFunctionNames } from 'shared-models/routes-and-paths/fb-function-names';
import { WebpageLoadFailureData } from 'shared-models/ssr/webpage-load-failure-data.model';

export const callWebpageLoadFailureEmail = async (webpageLoadFailureData: WebpageLoadFailureData) => {
  const triggerEmailHttpCall = firebase.default.functions().httpsCallable(PublicFunctionNames.TRIGGER_WEBPAGE_LOAD_FAILURE_EMAIL);
  
  const emailResponse = await triggerEmailHttpCall( webpageLoadFailureData);

  console.log('callWebpageLoadFailureEmail submitted', emailResponse);

  return emailResponse;
}