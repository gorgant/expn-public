import * as functions from 'firebase-functions';
import * as Stripe from 'stripe';
import { publicFirestore } from '../db';

// Iniitialize Cloud Firestore Database
export const db = publicFirestore;
const settings = { timestampsInSnapshots: true };
db.settings(settings);

// ENV Variables
const stripeSecret: string = functions.config().stripe.secret;

//Export Stripe
export const stripe = new Stripe(stripeSecret);

