-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('LOGIN', 'REGISTER', 'VIEW_PAGE', 'SUBMIT_FORM', 'UPDATE_PROFILE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."NotificationCategory" AS ENUM ('SYSTEM', 'EMAIL', 'SECURITY', 'BILLING', 'REVIEW', 'COMPARISON', 'SOCIAL');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."PointsTransactionType" AS ENUM ('EARNED_REFERRAL_REGISTER', 'EARNED_REFERRAL_FIRST_LOGIN', 'EARNED_REFERRAL_FIRST_ACTIVITY', 'SPENT_FEATURE', 'EXPIRED', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "public"."ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'REWARDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ConversionStep" AS ENUM ('CLICK', 'REGISTER', 'FIRST_LOGIN', 'FIRST_ACTIVITY');

-- CreateEnum
CREATE TYPE "public"."StatsPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."EmailPriority" AS ENUM ('HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "public"."EmailTaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."oauth_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "providerName" TEXT,
    "providerAvatar" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "deviceType" TEXT,
    "deviceName" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" "public"."ActivityType" NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "category" "public"."NotificationCategory" NOT NULL,
    "priority" "public"."NotificationPriority" NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "actionData" JSONB,
    "metadata" JSONB,
    "relatedId" TEXT,
    "relatedType" TEXT,
    "expiresAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailDigest" TEXT NOT NULL DEFAULT 'immediate',
    "emailDigestTime" TEXT,
    "emailCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emailMinPriority" TEXT,
    "browserEnabled" BOOLEAN NOT NULL DEFAULT true,
    "browserSound" BOOLEAN NOT NULL DEFAULT true,
    "browserDesktop" BOOLEAN NOT NULL DEFAULT true,
    "browserCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "browserMinPriority" TEXT,
    "mobileEnabled" BOOLEAN NOT NULL DEFAULT true,
    "mobilePush" BOOLEAN NOT NULL DEFAULT true,
    "mobileCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mobileMinPriority" TEXT,
    "mobileQuietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mobileQuietHoursStart" TEXT,
    "mobileQuietHoursEnd" TEXT,
    "autoArchiveDays" INTEGER DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "availablePoints" INTEGER NOT NULL DEFAULT 0,
    "spentPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."points_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "public"."PointsTransactionType" NOT NULL,
    "relatedId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referrals" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "status" "public"."ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "utmParams" JSONB,
    "rewardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_clicks" (
    "id" TEXT NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "utmParams" JSONB,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_conversions" (
    "id" TEXT NOT NULL,
    "referralCodeId" TEXT NOT NULL,
    "clickId" TEXT,
    "stepType" "public"."ConversionStep" NOT NULL,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."referral_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" "public"."StatsPeriod" NOT NULL,
    "periodDate" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "rewards" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_send_tasks" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "textContent" TEXT,
    "templateId" TEXT,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "priority" "public"."EmailPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "public"."EmailTaskStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_send_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "authorId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "oauth_accounts_userId_idx" ON "public"."oauth_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_providerId_key" ON "public"."oauth_accounts"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "public"."user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "public"."user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_sessionToken_idx" ON "public"."user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_activities_userId_activityType_idx" ON "public"."user_activities"("userId", "activityType");

-- CreateIndex
CREATE INDEX "user_activities_userId_createdAt_idx" ON "public"."user_activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_createdAt_idx" ON "public"."user_activities"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_status_idx" ON "public"."notifications"("userId", "status");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "public"."notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_category_priority_idx" ON "public"."notifications"("category", "priority");

-- CreateIndex
CREATE INDEX "notifications_expiresAt_idx" ON "public"."notifications"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "public"."notification_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_points_userId_key" ON "public"."user_points"("userId");

-- CreateIndex
CREATE INDEX "points_transactions_userId_createdAt_idx" ON "public"."points_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "points_transactions_type_idx" ON "public"."points_transactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "public"."referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_codes_userId_idx" ON "public"."referral_codes"("userId");

-- CreateIndex
CREATE INDEX "referral_codes_code_idx" ON "public"."referral_codes"("code");

-- CreateIndex
CREATE INDEX "referrals_referrerId_status_idx" ON "public"."referrals"("referrerId", "status");

-- CreateIndex
CREATE INDEX "referrals_referralCodeId_idx" ON "public"."referrals"("referralCodeId");

-- CreateIndex
CREATE INDEX "referrals_createdAt_idx" ON "public"."referrals"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referredUserId_key" ON "public"."referrals"("referredUserId");

-- CreateIndex
CREATE INDEX "referral_clicks_referralCodeId_createdAt_idx" ON "public"."referral_clicks"("referralCodeId", "createdAt");

-- CreateIndex
CREATE INDEX "referral_clicks_ipAddress_idx" ON "public"."referral_clicks"("ipAddress");

-- CreateIndex
CREATE INDEX "referral_conversions_referralCodeId_stepType_idx" ON "public"."referral_conversions"("referralCodeId", "stepType");

-- CreateIndex
CREATE INDEX "referral_conversions_clickId_idx" ON "public"."referral_conversions"("clickId");

-- CreateIndex
CREATE INDEX "referral_conversions_createdAt_idx" ON "public"."referral_conversions"("createdAt");

-- CreateIndex
CREATE INDEX "referral_stats_userId_period_idx" ON "public"."referral_stats"("userId", "period");

-- CreateIndex
CREATE INDEX "referral_stats_periodDate_idx" ON "public"."referral_stats"("periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "referral_stats_userId_period_periodDate_key" ON "public"."referral_stats"("userId", "period", "periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "public"."articles"("slug");

-- CreateIndex
CREATE INDEX "articles_authorId_idx" ON "public"."articles"("authorId");

-- CreateIndex
CREATE INDEX "articles_published_publishedAt_idx" ON "public"."articles"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "articles_slug_idx" ON "public"."articles"("slug");

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_points" ADD CONSTRAINT "user_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."points_transactions" ADD CONSTRAINT "points_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_codes" ADD CONSTRAINT "referral_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referrals" ADD CONSTRAINT "referrals_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "public"."referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_clicks" ADD CONSTRAINT "referral_clicks_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "public"."referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_conversions" ADD CONSTRAINT "referral_conversions_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "public"."referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."referral_conversions" ADD CONSTRAINT "referral_conversions_clickId_fkey" FOREIGN KEY ("clickId") REFERENCES "public"."referral_clicks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
