import { ProductIdList } from '../products/product-id-list.model';
import { ProductEmailTemplateList } from './product-email-template.model';

export enum EmailCategories {
  SUBSCRIPTION_CONFIRMATION = 'subscription_confirmation',
  CONTACT_FORM_CONFIRMATION = 'contact_form_confirmation',
  PURCHASE_CONFIRMATION = 'purchase_confirmation',
}

export enum EmailProductNames {
  REMOTE_COACH = 'remote_coach',
}

// Ids sourced from Sendgrid template system
export enum EmailTemplateIds {
  SUBSCRIPTION_CONFIRMATION = 'd-a5178c4ee40244649122e684d244f6cc',
  CONTACT_FORM_CONFIRMATION = 'd-c333f6f223d24ba8925e35e08caa37b5',
  REMOTE_COACH_PURCHASE_CONFIRMATION = 'd-a1dd923aa818453d8de0b30253af7a05'
}

// Set the key to the Product ID Searchable by product ID
export const ProductEmailTemplates: ProductEmailTemplateList = {
  [ProductIdList.REMOTE_COACH]: {
    templateId: EmailTemplateIds.REMOTE_COACH_PURCHASE_CONFIRMATION,
    productId: ProductIdList.REMOTE_COACH
  },
  [ProductIdList.SANDBOX_REMOTE_COACH]: {
    templateId: EmailTemplateIds.REMOTE_COACH_PURCHASE_CONFIRMATION,
    productId: ProductIdList.SANDBOX_REMOTE_COACH
  },
  [ProductIdList.SANDBOX_ANOTHER_COOL_PRODUCT]: {
    templateId: EmailTemplateIds.REMOTE_COACH_PURCHASE_CONFIRMATION,
    productId: ProductIdList.SANDBOX_REMOTE_COACH
  }
};

export enum EmailSenderAddresses {
  DEFAULT = 'hello@myexplearning.com',
  ORDERS = 'orders@myexplearning.com'

}

export enum EmailSenderNames {
  DEFAULT = 'Explearning'
}

export const EmailBccAddresses = {
  GREG_ONLY: 'greg@myexplearning.com',
  GREG_AND_MD: ['greg@myexplearning.com, md@myexplearning.com']
};