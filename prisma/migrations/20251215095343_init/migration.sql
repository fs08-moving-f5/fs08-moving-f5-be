-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'DRIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RegionEnum" AS ENUM ('서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '부산', '울산', '제주');

-- CreateEnum
CREATE TYPE "ServiceEnum" AS ENUM ('SMALL_MOVING', 'HOME_MOVING', 'OFFICE_MOVING');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('FROM', 'TO');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REQUEST_SENT', 'REQUEST_REJECTED', 'REQUEST_CANCELLED', 'ESTIMATE_RECEIVED', 'ESTIMATE_CONFIRMED', 'ESTIMATE_REJECTED', 'ESTIMATE_EXPIRED', 'NEW_REVIEW', 'FAVORITE_ADDED', 'SYSTEM_NOTICE', 'PROMOTION');

-- CreateEnum
CREATE TYPE "HistoryActionType" AS ENUM ('CREATE_REQUEST', 'UPDATE_REQUEST', 'DELETE_REQUEST', 'CONFIRMED_ESTIMATE', 'REJECTED_ESTIMATE', 'CREATE_ESTIMATE', 'UPDATE_ESTIMATE', 'DELETE_ESTIMATE', 'EXPIRED_ESTIMATE', 'CREATE_FAVORITE', 'DELETE_FAVORITE', 'CREATE_REVIEW', 'UPDATE_REVIEW', 'DELETE_REVIEW', 'UPDATE_PROFILE', 'UPDATE_ADDRESS');

-- CreateEnum
CREATE TYPE "HistoryEntityType" AS ENUM ('USER', 'USER_PROFILE', 'DRIVER_PROFILE', 'ESTIMATE_REQUEST', 'ESTIMATE_RESPONSE', 'ADDRESS', 'REVIEW', 'FAVORITE_DRIVER', 'NOTIFICATION', 'HISTORY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "type" "UserType" NOT NULL DEFAULT 'USER',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" INTEGER NOT NULL,
    "refreshTokens" TEXT,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "regions" "RegionEnum"[],
    "services" "ServiceEnum"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverProfile" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "career" TEXT,
    "shortIntro" TEXT,
    "description" TEXT,
    "regions" "RegionEnum"[],
    "services" "ServiceEnum"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movingType" "ServiceEnum" NOT NULL,
    "movingDate" TIMESTAMP(3) NOT NULL,
    "status" "EstimateStatus" NOT NULL DEFAULT 'PENDING',
    "isDesignated" BOOLEAN NOT NULL DEFAULT false,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstimateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "estimateRequestId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "price" INTEGER,
    "comment" TEXT,
    "rejectReason" TEXT,
    "status" "EstimateStatus" NOT NULL DEFAULT 'PENDING',
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "estimateRequestId" TEXT NOT NULL,
    "addressType" "AddressType" NOT NULL,
    "zoneCode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "addressEnglish" TEXT NOT NULL,
    "sido" TEXT NOT NULL,
    "sidoEnglish" TEXT NOT NULL,
    "sigungu" TEXT NOT NULL,
    "sigunguEnglish" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteDriver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavoriteDriver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "datajson" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" "HistoryActionType" NOT NULL,
    "actionDesc" TEXT,
    "entityType" "HistoryEntityType",
    "entityId" TEXT,
    "previousData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_driverId_key" ON "DriverProfile"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_estimateRequestId_driverId_key" ON "Estimate"("estimateRequestId", "driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_estimateRequestId_addressType_key" ON "Address"("estimateRequestId", "addressType");

-- CreateIndex
CREATE UNIQUE INDEX "Review_estimateId_key" ON "Review"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteDriver_userId_driverId_key" ON "FavoriteDriver"("userId", "driverId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateRequest" ADD CONSTRAINT "EstimateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_estimateRequestId_fkey" FOREIGN KEY ("estimateRequestId") REFERENCES "EstimateRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_estimateRequestId_fkey" FOREIGN KEY ("estimateRequestId") REFERENCES "EstimateRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteDriver" ADD CONSTRAINT "FavoriteDriver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteDriver" ADD CONSTRAINT "FavoriteDriver_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
