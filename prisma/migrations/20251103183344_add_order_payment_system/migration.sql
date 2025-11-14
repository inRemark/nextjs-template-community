-- CreateEnum
CREATE TYPE "public"."FeatureType" AS ENUM ('THEME_CLONE', 'SCREENSHOT');

-- CreateEnum
CREATE TYPE "public"."PriceType" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('STRIPE', 'ALIPAY', 'WECHAT');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'SENT', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "featureType" "public"."FeatureType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_prices" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "region" TEXT NOT NULL DEFAULT 'global',
    "type" "public"."PriceType" NOT NULL DEFAULT 'ONE_TIME',
    "interval" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "featureData" JSONB,
    "resultData" JSONB,
    "remark" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "paymentGateway" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" TEXT,
    "transactionId" TEXT,
    "checkoutUrl" TEXT,
    "redirectUrl" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refunds" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reason" TEXT,
    "status" "public"."RefundStatus" NOT NULL DEFAULT 'PENDING',
    "refundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingName" TEXT NOT NULL,
    "billingTaxId" TEXT,
    "billingAddress" TEXT,
    "billingEmail" TEXT,
    "pdfUrl" TEXT,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "issuedAt" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "public"."products"("slug");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "public"."products"("slug");

-- CreateIndex
CREATE INDEX "products_featureType_idx" ON "public"."products"("featureType");

-- CreateIndex
CREATE INDEX "product_prices_productId_idx" ON "public"."product_prices"("productId");

-- CreateIndex
CREATE INDEX "product_prices_currency_idx" ON "public"."product_prices"("currency");

-- CreateIndex
CREATE INDEX "product_prices_region_idx" ON "public"."product_prices"("region");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "public"."orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "public"."orders"("userId");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "public"."orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "public"."orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "public"."orders"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "public"."payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "public"."payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_paymentIntentId_idx" ON "public"."payments"("paymentIntentId");

-- CreateIndex
CREATE INDEX "payments_transactionId_idx" ON "public"."payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "public"."refunds"("paymentId");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "public"."refunds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_orderId_key" ON "public"."invoices"("orderId");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "public"."invoices"("userId");

-- CreateIndex
CREATE INDEX "invoices_invoiceNumber_idx" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- AddForeignKey
ALTER TABLE "public"."product_prices" ADD CONSTRAINT "product_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
