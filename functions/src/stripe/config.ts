import * as functions from 'firebase-functions';
import * as Stripe from 'stripe';
import { adminFirestore } from '../db';

// Iniitialize Cloud Firestore Database
export const db = adminFirestore;
const settings = { timestampsInSnapshots: true };
db.settings(settings);

// ENV Variables
export const stripeSecret = functions.config().stripe.secret;

//Export Stripe
export const stripe = new Stripe(stripeSecret);

