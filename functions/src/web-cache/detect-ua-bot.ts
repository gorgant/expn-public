import * as functions from 'firebase-functions';

//// EXPORTED FUNCTIONS ////

// List of bots to target, add more if you'd like
export const detectUaBot = (userAgent: any) => {

  const bots = [
    // search engine crawler bots
    'googlebot',
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'slurp',
    // social media link bots
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'baiduspider',
    'pinterest',
    'slackbot',
    'vkshare',
    'facebot',
    'outbrain',
    'w3c_validator',
    'quora link preview',
    'quora-bot/1.0',
    'rogerbot',
    'showyoubot',
    'telegramBot',
    'vkshare',
    'whatsapp',
  ]

  // Return true if the user-agent header matches a bot namespace
  const agent = userAgent.toLowerCase();

  for (const bot of bots) {
    if (agent.indexOf(bot) > -1) {
      functions.logger.log(`bot detected ${bot}`);
      return true;
    }
  }

  functions.logger.log('no bots found');
  return false;
}
