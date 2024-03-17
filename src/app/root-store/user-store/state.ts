import { FirebaseError } from "firebase/app";
import { PublicStoreFeatureKeys } from "../../../../shared-models/store/feature-keys.model";
import { PublicUser } from "../../../../shared-models/user/public-user.model";

export interface UserState {
  processSubscriptionFormError: FirebaseError | Error | null,
  processSubscriptionFormProcessing: boolean,
  processContactFormError: FirebaseError | Error | null,
  processContactFormProcessing: boolean,
  verifyEmailError: FirebaseError | Error | null,
  verifyEmailProcessing: boolean,
  verifyEmailSucceeded: boolean,
  publicUserData: PublicUser | null,
  userSubmittedForm: boolean,
}

export const initialUserState: UserState = {
  processSubscriptionFormError: null,
  processSubscriptionFormProcessing: false,
  processContactFormError: null,
  processContactFormProcessing: false,
  verifyEmailError: null,
  verifyEmailProcessing: false,
  verifyEmailSucceeded: false,
  publicUserData: null,
  userSubmittedForm: false,
}