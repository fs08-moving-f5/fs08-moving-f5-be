/*
  Warnings:

  - You are about to drop the column `actionDesc` on the `History` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_estimateId_fkey";

-- DropIndex
DROP INDEX "Estimate_driverId_isDelete_createdAt_idx";

-- DropIndex
DROP INDEX "Estimate_estimateRequestId_status_isDelete_idx";

-- DropIndex
DROP INDEX "EstimateRequest_isDesignated_designatedDriverId_status_isDe_idx";

-- DropIndex
DROP INDEX "EstimateRequest_status_isDelete_movingDate_idx";

-- DropIndex
DROP INDEX "EstimateRequest_status_isDelete_movingType_createdAt_idx";

-- DropIndex
DROP INDEX "EstimateRequest_userId_isDelete_createdAt_idx";

-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "History" DROP COLUMN "actionDesc";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
DROP VIEW IF EXISTS "DriverStatusView";

-- CreateIndex
CREATE INDEX "Estimate_driverId_createdAt_idx" ON "Estimate"("driverId", "createdAt");

-- CreateIndex
CREATE INDEX "Estimate_estimateRequestId_idx" ON "Estimate"("estimateRequestId");

-- CreateIndex
CREATE INDEX "EstimateRequest_movingType_createdAt_idx" ON "EstimateRequest"("movingType", "createdAt");

-- CreateIndex
CREATE INDEX "EstimateRequest_movingDate_idx" ON "EstimateRequest"("movingDate");

-- CreateIndex
CREATE INDEX "EstimateRequest_userId_createdAt_idx" ON "EstimateRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "EstimateRequest_isDesignated_designatedDriverId_idx" ON "EstimateRequest"("isDesignated", "designatedDriverId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
