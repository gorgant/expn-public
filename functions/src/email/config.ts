import { HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import * as sendGridMail from '@sendgrid/mail';
import { PublicAppRoutes } from '../../../shared-models/routes-and-paths/app-routes.model';
import { sendgridApiSecret } from '../config/api-key-config';
import { publicAppUrl } from '../config/app-config';
import { WebsiteUrls } from '../../../shared-models/meta/web-urls.model';
import { SocialUrls } from '../../../shared-models/meta/social-urls.model';

// Initialize SG and export
export const getSgMail = () => {
  logger.log('Initializing Sendgrid Mail service');
  const sendgrid = sendGridMail;
  const sgSecret = sendgridApiSecret.value();
  if (!sgSecret) {
    const err = `Error initializing Sendgrid Mail service. No sendgridSecret value available.`;
    logger.log(err); throw new HttpsError('failed-precondition', err);
  }
  sendGridMail.setApiKey(sgSecret);
  return sendgrid;
}

// Useful links for emails
const academyUrl = WebsiteUrls.ACDMY_HOME;
const appUrl = publicAppUrl;
const blogSlugWithSlashPrefix = PublicAppRoutes.BLOG;
const blogUrl = `https://${appUrl}${blogSlugWithSlashPrefix}`;
const emailVerificationSlugWithSlahPrefeix = PublicAppRoutes.EMAIL_VERIFICATION;
const emailVerificationUrlNoParams = `https://${appUrl}${emailVerificationSlugWithSlahPrefeix}`;
const youtubeUrl = SocialUrls.EXPN_YOUTUBE;

export const EmailWebsiteLinks = {
  ACADEMY_URL: academyUrl,
  BLOG_URL: blogUrl,
  EMAIL_VERIFICATION_URL_NO_PARAMS: emailVerificationUrlNoParams,
  YOUTUBE_URL: youtubeUrl,
};

const sendgridBaseApiUrl = 'https://api.sendgrid.com/v3';
export const sendgridMarketingContactsApiUrl = `${sendgridBaseApiUrl}/marketing/contacts`;
export const sendgridMarketingListsApiUrl = `${sendgridBaseApiUrl}/marketing/lists`;
export const sendgridContactsApiUrl = `${sendgridBaseApiUrl}/marketing/contacts`;
export const sendgridGlobalSuppressionsApiUrl = `${sendgridBaseApiUrl}/asm/suppressions/global`;
export const sendgridGlobalSuppressionsQueryApiUrl = `${sendgridBaseApiUrl}/suppression/unsubscribes`;
export const sendgridGroupSuppressionsApiUrl = `${sendgridBaseApiUrl}/asm/groups`;
