import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { Invoice } from '../models/billing/invoice.model';
import { Observable, throwError, pipe, from } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { now } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private authService: AuthService,
  ) { }

  // fetchSingleInvoice(userId: string, invoiceId: string): Observable<Invoice> {
  //   const invoiceDoc = this.getInvoiceDoc(userId, invoiceId);
  //   return invoiceDoc.valueChanges()
  //     .pipe(
  //       takeUntil(this.authService.unsubTrigger$),
  //       map(invoice => {
  //         console.log('Fetched this item', invoice);
  //         return invoice;
  //       }),
  //       catchError(error => {
  //         console.log('Error fetching invoice', error);
  //         return throwError(error);
  //       })
  //     );
  // }

  fetchLatestInvoice(userId: string): Observable<Invoice> {
    // This collection will only have one record
    const collection = this.getLatestInvoiceCollectionQuery(userId);

    // Return first item of array (the only item)
    return collection.valueChanges()
      .pipe(
        takeUntil(this.authService.unsubTrigger$),
        map(invoiceArray => {
          if (invoiceArray.length > 0) {
            return invoiceArray[0];
          } else {
            console.log('No existing invoice found');
            return null;
          }
        })
      );
  }

  createInvoice(invoiceNoId: Invoice): Observable<Invoice> {
    const newInvoiceId = this.generateInvoiceId();
    const invoiceWithId: Invoice = {
      ...invoiceNoId,
      id: newInvoiceId,
    };
    const fbResponse = this.getInvoiceCollection(invoiceWithId.anonymousUID).doc(invoiceWithId.id).set(invoiceWithId)
      .then(empty => {
        console.log('Invoice created', invoiceWithId);
        return invoiceWithId;
      })
      .catch(error => {
        return throwError(error).toPromise();
      });

    return from(fbResponse);
  }

  updateInvoice(invoice: Invoice): Observable<Invoice> {
    const fbResponse = this.getInvoiceDoc(invoice.anonymousUID, invoice.id).update(invoice)
      .then(empty => {
        console.log('Invoice updated', invoice);
        return invoice;
      })
      .catch(error => {
        console.log('Error updating post', error);
        return throwError(error).toPromise();
      });

    return from(fbResponse);
  }


  private generateInvoiceId(): string {
    return this.afs.createId();
  }

  private getInvoiceCollection(userId): AngularFirestoreCollection<Invoice> {
    return this.userService.getUserDoc(userId).collection<Invoice>('invoices');
  }

  private getInvoiceDoc(userId: string, invoiceId: string): AngularFirestoreDocument<Invoice> {
    return this.getInvoiceCollection(userId).doc(invoiceId);
  }

  private getLatestInvoiceCollectionQuery(userId: string): AngularFirestoreCollection<Invoice> {
    return this.userService.getUserDoc(userId).collection<Invoice>('invoices', ref => ref.orderBy('lastModified', 'desc').limit(1));
  }
}
