import { Injectable, inject } from '@angular/core';
import { collection, doc, DocumentReference, CollectionReference, Firestore } from '@angular/fire/firestore';
import { Functions, httpsCallableData }  from '@angular/fire/functions';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, delay, map, mergeMap, take } from 'rxjs/operators';
import { PublicUser, PublicUserKeys } from '../../../../shared-models/user/public-user.model';
import { PublicFunctionNames } from '../../../../shared-models/routes-and-paths/fb-function-names.model';
import { UiService } from './ui.service';
import { PublicCollectionPaths } from '../../../../shared-models/routes-and-paths/fb-collection-paths.model';
import { UnsubscribeRecord, UnsubscribeRecordList } from '../../../../shared-models/email/unsubscribe-record.model';
import { ContactForm } from '../../../../shared-models/user/contact-form.model';
import { HelperService } from './helpers.service';
import { GoogleCloudFunctionsTimestamp } from '../../../../shared-models/firestore/google-cloud-functions-timestamp.model';
import { SubscriberData } from '../../../../shared-models/email/subscriber-data.model';

@Injectable({
  providedIn: 'root'
})
export class WebFormService {

  private firestore = inject(Firestore);
  private functions = inject(Functions);
  private uiService = inject(UiService);
  private helperService = inject(HelperService);

  constructor() { }

  processSubscriptionForm(subscriberData: SubscriberData): Observable<PublicUser> {
    // const fakeUser: PublicUser = {
    //   id: 'coolID'
    // } as any;
    // return of(fakeUser).pipe(
    //   delay(5000)
    // );

    // return timer(5000).pipe(
    //   mergeMap(() => throwError(() => new Error('Error after 5 seconds')))
    // );

    const processSubscriptionFormHttpCall: (data: SubscriberData) => 
      Observable<PublicUser> = httpsCallableData(this.functions, PublicFunctionNames.ON_CALL_PROCESS_EMAIL_SUBSCRIPTION);
    
    return processSubscriptionFormHttpCall(subscriberData)
      .pipe(
        take(1),
        map(serverUserData => {
          // const dbUser = this.fetchPublicUser(serverUserData.id); // Note that Cloud Functions returns a map rather than a Timestamp object, so instead fetch updated user from Firestore to get cleaner timestmap data
          const formattedUser: PublicUser = {
            ...serverUserData,
            [PublicUserKeys.CREATED_TIMESTAMP]: this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.CREATED_TIMESTAMP] as GoogleCloudFunctionsTimestamp),
            [PublicUserKeys.EMAIL_OPT_IN_TIMESTAMP]: serverUserData[PublicUserKeys.EMAIL_OPT_IN_TIMESTAMP] ? this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.EMAIL_OPT_IN_TIMESTAMP] as GoogleCloudFunctionsTimestamp) : null,
            [PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP]: serverUserData[PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP] ? this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP] as GoogleCloudFunctionsTimestamp) : null,
            [PublicUserKeys.EMAIL_SENDGRID_CONTACT_CREATED_TIMESTAMP]: serverUserData[PublicUserKeys.EMAIL_SENDGRID_CONTACT_CREATED_TIMESTAMP] ? this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.EMAIL_SENDGRID_CONTACT_CREATED_TIMESTAMP] as GoogleCloudFunctionsTimestamp) : null,
            [PublicUserKeys.LAST_MODIFIED_TIMESTAMP]: this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.LAST_MODIFIED_TIMESTAMP] as GoogleCloudFunctionsTimestamp),
          };
          if (serverUserData[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE]) {
            const formattedGlobalUnsubscribe: UnsubscribeRecord = {
              ...serverUserData[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE],
              unsubscribeTimestamp: this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE].unsubscribeTimestamp as GoogleCloudFunctionsTimestamp)
            }
            formattedUser[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE] = formattedGlobalUnsubscribe
          }
          if (serverUserData[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES]) {
            const formattedGroupUnsubscribeRecordList: UnsubscribeRecordList = {
              ...serverUserData[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES]
            };
            const groupUnsubscribeObjectList: UnsubscribeRecordList = serverUserData[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES];
            Object.keys(groupUnsubscribeObjectList).forEach(key => {
              const formattedTimestampValue = this.helperService.convertGoogleCloudTimestampToMs(groupUnsubscribeObjectList[+key].unsubscribeTimestamp as GoogleCloudFunctionsTimestamp); // Convert key to number since this object has numeric keys
              groupUnsubscribeObjectList[+key].unsubscribeTimestamp = formattedTimestampValue;
            });
            formattedUser[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES] = formattedGroupUnsubscribeRecordList;
          }
          console.log('Contact form processed and user created.', formattedUser);
          return formattedUser;
        }),
        catchError(error => {
          console.log('Error creating publicUser', error);
          this.uiService.showSnackBar('Hmm, something went wrong. Refresh the page and try again.', 10000);
          return throwError(() => new Error(error));
        })
      );
  }

  processContactForm(contactForm: ContactForm): Observable<PublicUser | null> {

    const processContactFormHttpCall: (data: ContactForm) => 
      Observable<PublicUser | null> = httpsCallableData(this.functions, PublicFunctionNames.ON_CALL_PROCESS_CONTACT_FORM);
    
    return processContactFormHttpCall(contactForm)
      .pipe(
        take(1),
        map(serverUserData => {
          if (!serverUserData) {
            console.log('Contact form processed, no user created.');
            return null;
          }
          // const dbUser = this.fetchPublicUser(serverUserData!.id); // Note that Cloud Functions returns a map rather than a Timestamp object, so instead fetch updated user from Firestore to get cleaner timestmap data
          const formattedUser: PublicUser = {
            ...serverUserData,
            [PublicUserKeys.CREATED_TIMESTAMP]: this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.CREATED_TIMESTAMP] as GoogleCloudFunctionsTimestamp),
            [PublicUserKeys.EMAIL_OPT_IN_TIMESTAMP]: serverUserData[PublicUserKeys.EMAIL_OPT_IN_TIMESTAMP] ? this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.EMAIL_OPT_IN_TIMESTAMP] as GoogleCloudFunctionsTimestamp) : null,
            [PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP]: serverUserData[PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP] ? this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.EMAIL_OPT_OUT_TIMESTAMP] as GoogleCloudFunctionsTimestamp) : null,
            [PublicUserKeys.EMAIL_SENDGRID_CONTACT_CREATED_TIMESTAMP]: serverUserData[PublicUserKeys.EMAIL_SENDGRID_CONTACT_CREATED_TIMESTAMP] ? this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.EMAIL_SENDGRID_CONTACT_CREATED_TIMESTAMP] as GoogleCloudFunctionsTimestamp) : null,
            [PublicUserKeys.LAST_MODIFIED_TIMESTAMP]: this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.LAST_MODIFIED_TIMESTAMP] as GoogleCloudFunctionsTimestamp),
          };
          if (serverUserData[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE]) {
            const formattedGlobalUnsubscribe: UnsubscribeRecord = {
              ...serverUserData[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE],
              unsubscribeTimestamp: this.helperService.convertGoogleCloudTimestampToMs(serverUserData[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE].unsubscribeTimestamp as GoogleCloudFunctionsTimestamp)
            }
            formattedUser[PublicUserKeys.EMAIL_GLOBAL_UNSUBSCRIBE] = formattedGlobalUnsubscribe
          }
          if (serverUserData[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES]) {
            const formattedGroupUnsubscribeRecordList: UnsubscribeRecordList = {
              ...serverUserData[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES]
            };
            const groupUnsubscribeObjectList: UnsubscribeRecordList = serverUserData[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES];
            Object.keys(groupUnsubscribeObjectList).forEach(key => {
              const formattedTimestampValue = this.helperService.convertGoogleCloudTimestampToMs(groupUnsubscribeObjectList[+key].unsubscribeTimestamp as GoogleCloudFunctionsTimestamp); // Convert key to number since this object has numeric keys
              groupUnsubscribeObjectList[+key].unsubscribeTimestamp = formattedTimestampValue;
            });
            formattedUser[PublicUserKeys.EMAIL_GROUP_UNSUBSCRIBES] = formattedGroupUnsubscribeRecordList;
          }
          console.log('Contact form processed and user created.', formattedUser);
          return formattedUser;
        }),
        catchError(error => {
          console.log('Error creating publicUser', error);
          this.uiService.showSnackBar('Hmm, something went wrong. Refresh the page and try again.', 10000);
          return throwError(() => new Error(error));
        })
      );
  }

  private getPublicUserCollection(): CollectionReference<PublicUser> {
    return collection(this.firestore, PublicCollectionPaths.PUBLIC_USERS) as CollectionReference<PublicUser>;
  }

  private getPublicUserDoc(publicUserId: string): DocumentReference<PublicUser> {
    return doc(this.getPublicUserCollection(), publicUserId);
  }

}


