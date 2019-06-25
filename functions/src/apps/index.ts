import * as admin from 'firebase-admin';

// Local app intialization will automatically select sandbox or production based on which environment initialized it
export const publicApp = admin.initializeApp();