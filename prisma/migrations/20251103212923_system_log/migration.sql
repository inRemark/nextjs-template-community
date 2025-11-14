-- CreateEnum
CREATE TYPE "public"."LogType" AS ENUM ('PAYMENT_WEBHOOK', 'API_CALL', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "public"."system_logs" (
    "id" TEXT NOT NULL,
    "type" "public"."LogType" NOT NULL,
    "level" "public"."LogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "url" TEXT,
    "method" TEXT,
    "status" INTEGER,
    "source" TEXT,
    "userId" TEXT,
    "context" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_logs_type_createdAt_idx" ON "public"."system_logs"("type", "createdAt");

-- CreateIndex
CREATE INDEX "system_logs_userId_createdAt_idx" ON "public"."system_logs"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."system_logs" ADD CONSTRAINT "system_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
