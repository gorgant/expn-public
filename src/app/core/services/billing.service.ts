import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { Invoice } from '../models/billing/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(
    private afs: AngularFirestore,
    private userService: UserService
  ) { }


  private generateInvoiceId(): string {
    return this.afs.createId();
  }

  private getInvoiceCollection(userId): AngularFirestoreCollection<Invoice> {
    return this.userService.getUserDoc(userId).collection<Invoice>('invoices');
  }

  private getInvoiceDoc(userId: string, invoiceId: string): AngularFirestoreDocument<Invoice> {
    return this.getInvoiceCollection(userId).doc(invoiceId);
  }
}
