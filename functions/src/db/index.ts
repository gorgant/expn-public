import { publicApp, getExplearningAdminApp } from "../apps";

// LOCAL VARIABLES
export const publicFirestore = publicApp.firestore();

// ADMIN VARIABLES
export const adminFirestore = getExplearningAdminApp().firestore();