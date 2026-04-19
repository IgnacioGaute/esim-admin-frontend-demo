// @/admin/utils/interfaces/company-topup.interface.ts

export enum CompanyTopupProvider {
  WEBPAY = "webpay",
  KHIPU = "khipu",
  BANK_TRANSFER = "bank_transfer",
}

export enum CompanyTopupStatus {
  INITIALIZED = "initialized",
  PENDING = "pending",
  PENDING_BANK_TRANSFER = "pending_bank_transfer",
  PAID = "paid",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export interface ICompanyTopupCompany {
  id: string
  name?: string
}

export interface ICompanyTopupUser {
  id: string
  name?: string
  email?: string
  type?: string
}

export interface ICompanyTopup {
  id: string
  companyId: string
  company?: ICompanyTopupCompany | null

  createdByUserId?: string | null
  createdByUser?: ICompanyTopupUser | null

  provider?: CompanyTopupProvider | null
  status: CompanyTopupStatus

  amountUsd: number
  amountClp: number
  exchangeRateUsed?: number | null

  sessionId?: string | null
  buyOrder?: string | null
  externalPaymentId?: string | null
  transactionId?: string | null

  paymentUrl?: string | null
  paymentResult?: any

  bankTransferReference?: string | null
  bankTransferReceiptUrl?: string | null
  bankTransferBlobName?: string | null
  bankTransferNote?: string | null

  reviewedByUserId?: string | null
  reviewedByUser?: ICompanyTopupUser | null
  reviewedAt?: string | null

  paidAt?: string | null
  rejectedAt?: string | null
  rejectionReason?: string | null

  balanceApplied: boolean
  balanceAppliedAt?: string | null

  createdAt: string
  updatedAt: string
}