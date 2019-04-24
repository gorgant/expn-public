import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { Invoice } from '../models/billing/invoice.model';
import { Observable, throwError, pipe, from } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { now } from 'moment';
import { PaymentResponseMsg } from '../models/billing/payment-response-msg.model';
import { Store } from '@ngrx/store';
import { RootStoreState, UserStoreActions } from 'src/app/root-store';
import { PaymentSvrResponse } from '../models/billing/payment-svr-response.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private authService: AuthService,
    private store$: Store<RootStoreState.State>,
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

  // Note additional fields are set in proccessInvoice()
  createInvoice(invoice: Invoice): Observable<Invoice> {
    const updatedInvoice: Invoice = {
      ...invoice,
      lastModified: now()
    };
    const fbResponse = this.getInvoiceCollection(updatedInvoice.anonymousUID).doc(updatedInvoice.id).set(updatedInvoice)
      .then(empty => {
        console.log('Invoice created', updatedInvoice);
        return updatedInvoice;
      })
      .catch(error => {
        return throwError(error).toPromise();
      });

    return from(fbResponse);
  }

  private updateInvoice(invoice: Invoice): Observable<Invoice> {
    const updatedInvoice: Invoice = {
      ...invoice,
      lastModified: now()
    };
    const fbResponse = this.getInvoiceDoc(updatedInvoice.anonymousUID, updatedInvoice.id).update(updatedInvoice)
      .then(empty => {
        console.log('Invoice updated', updatedInvoice);
        return updatedInvoice;
      })
      .catch(error => {
        console.log('Error updating invoice', error);
        return throwError(error).toPromise();
      });

    return from(fbResponse);
  }

  processPayment(invoice: Invoice): Observable<PaymentSvrResponse> {
    const updatedInvoice: Invoice = {
      ...invoice,
      orderSubmitted: true,
      submittedDate: now(),
      lastModified: now(),
    };
    // Update invoice with pre-processing details
    this.updateInvoice(updatedInvoice);
    console.log('Updated invoice pre processing', invoice);

    // TODO: Send to server for processing
    const demoServerPromise: Promise<PaymentResponseMsg> = new Promise((resolve, reject) => {
      setTimeout(() => {
        const serverResponse = PaymentResponseMsg.REJECTED;
        console.log('Resolving server response', serverResponse);
        resolve(serverResponse);
      }, 5000);
    });

    const serverRes = demoServerPromise
      .then(serverResMsg => {
        console.log('Server response received', serverResMsg);
        let finalizedInvoice: Invoice;
        switch (serverResMsg) {
          case PaymentResponseMsg.ACCEPTED:
            finalizedInvoice = {
              ...updatedInvoice,
              paymentComplete: true,
              inoviceClosedDate: now(),
              lastModified: now(),
            };
            console.log('Payment accepted', finalizedInvoice);
            break;
          case PaymentResponseMsg.REJECTED:
            finalizedInvoice = {
              ...updatedInvoice,
              paymentComplete: false,
              previousPaymentAttempts:
                updatedInvoice.previousPaymentAttempts ? [...updatedInvoice.previousPaymentAttempts, updatedInvoice] : [updatedInvoice],
              lastModified: now(),
            };
            console.log('Payment rejected', finalizedInvoice);
            break;
          default:
            break;
        }
        this.updateInvoice(finalizedInvoice);

        const paymentResponse: PaymentSvrResponse = {
          responseMsg: serverResMsg,
          invoice: finalizedInvoice
        };
        return paymentResponse;
    });

    return from(serverRes);
  }

  private getInvoiceCollection(userId): AngularFirestoreCollection<Invoice> {
    return this.userService.getUserDoc(userId).collection<Invoice>('invoices');
  }

  private getInvoiceDoc(userId: string, invoiceId: string): AngularFirestoreDocument<Invoice> {
    return this.getInvoiceCollection(userId).doc(invoiceId);
  }

  private getLatestInvoiceCollectionQuery(userId: string): AngularFirestoreCollection<Invoice> {
    return this.userService.getUserDoc(userId).collection<Invoice>('invoices',
      ref => ref.where('orderSubmitted', '==', false).orderBy('lastModified', 'desc').limit(1)
    );
  }
}
