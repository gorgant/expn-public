import { FirebaseError } from "@angular/fire/app";
import { createAction, props } from "@ngrx/store";
import { ContactForm } from "../../../../shared-models/user/contact-form.model";
import { PublicUser } from "../../../../shared-models/user/public-user.model";
import { EmailVerificationData } from "../../../../shared-models/email/email-verification-data";
import { SubscriberData } from "../../../../shared-models/email/subscriber-data.model";

// Purge User State

export const purgeUserState = createAction(
  '[AppWide] Purge User State'
);

// Purge User State Errors

export const purgeUserStateErrors = createAction(
  '[AppWide] Purge User State Errors'
);

// Process Subscription Form

export const processSubscriptionFormRequested = createAction(
  '[Subscription Form] Process Subscription Form Requested',
  props<{subscriberData: SubscriberData}>()
);

export const processSubscriptionFormCompleted = createAction(
  '[WebForm Service] Process Subscription Form Completed',
  props<{newPublicUser: PublicUser}>()
);

export const processSubscriptionFormFailed = createAction(
  '[WebForm Service] Process Subscription Form Failed',
  props<{error: FirebaseError}>()
);

// Process Contact Form

export const processContactFormRequested = createAction(
  '[Contact Form] Process Contact Form Requested',
  props<{contactForm: ContactForm}>()
);

export const processContactFormCompleted = createAction(
  '[WebForm Service] Process Contact Form Completed',
);

export const processContactFormFailed = createAction(
  '[WebForm Service] Process Contact Form Failed',
  props<{error: FirebaseError}>()
);

// Verify Email
export const verifyEmailRequested = createAction(
  '[Email Verification Page] Verify Email Requested',
  props<{emailVerificationData: EmailVerificationData}>()
);

export const verifyEmailCompleted = createAction(
  '[User Service] Verify Email Completed',
  props<{verifyEmailSucceeded: boolean}>()
);

export const verifyEmailFailed = createAction(
  '[User Service] Verify Email Failed',
  props<{error: FirebaseError}>()
);

