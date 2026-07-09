export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  numberOfElements: number
  size: number
  number: number
}

export interface VoucherListItem {
  id: string
  voucherType: string
  voucherStatus: string
  voucherNumber: string
  voucherDate: string
  contactName: string
  totalAmount: number
  currency: string
  dueDate?: string
}

export type VoucherListResponse = PaginatedResponse<VoucherListItem>

export interface Invoice {
  id: string
  organizationId: string
  createdDate: string
  updatedDate: string
  version: number
  voucherNumber: string
  voucherDate: string
  totalPrice: {
    currency: string
    totalNetAmount: number
    totalGrossAmount: number
    totalTaxAmount: number
  }
  files?: {
    documentFileId?: string
  }
  [key: string]: unknown
}

export interface Contact {
  id: string
  organizationId: string
  version: number
  roles: Record<string, unknown>
  company?: {
    name: string
    [key: string]: unknown
  }
  person?: {
    firstName: string
    lastName: string
    [key: string]: unknown
  }
  emailAddresses?: Record<string, string[]>
  [key: string]: unknown
}

export type ContactsResponse = PaginatedResponse<Contact>

export interface Voucher {
  id: string
  organizationId: string
  type: string
  voucherNumber: string
  voucherDate: string
  voucherStatus: string
  totalGrossAmount: number
  totalTaxAmount: number
  taxType: string
  files?: {
    documentFileId?: string
  }
  [key: string]: unknown
}

export interface PostingCategory {
  id: string
  name: string
  type: "income" | "outgo"
  contactRequired: boolean
  splitAllowed: boolean
  groupName: string
}

export interface Country {
  countryCode: string
  countryNameDE: string
  countryNameEN: string
  taxClassification: "de" | "intraCommunity" | "thirdPartyCountry"
}

export interface PaymentCondition {
  id: string
  organizationId: string
  paymentTermLabelTemplate: string
  paymentTermDuration: number
  paymentDiscountConditions?: {
    discountPercentage: number
    discountRange: number
  }
  [key: string]: unknown
}

export interface Article {
  id: string
  organizationId: string
  version: number
  title: string
  type: "PRODUCT" | "SERVICE"
  [key: string]: unknown
}

export interface EventSubscription {
  subscriptionId: string
  organizationId: string
  createdDate: string
  eventType: string
  callbackUrl: string
  [key: string]: unknown
}

export interface Profile {
  organizationId: string
  companyName: string
  [key: string]: unknown
}
