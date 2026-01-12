-- DropIndex
DROP INDEX "Address_estimateRequestId_idx";

-- DropIndex
DROP INDEX "Address_sido_idx";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "officeAddress" TEXT,
ADD COLUMN     "officeLat" DOUBLE PRECISION,
ADD COLUMN     "officeLng" DOUBLE PRECISION,
ADD COLUMN     "officeSido" TEXT,
ADD COLUMN     "officeSigungu" TEXT,
ADD COLUMN     "officeUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "officeZoneCode" TEXT;

-- CreateIndex
CREATE INDEX "Address_sido_estimateRequestId_idx" ON "Address"("sido", "estimateRequestId");

-- CreateIndex
CREATE INDEX "Address_lat_lng_idx" ON "Address"("lat", "lng");

-- CreateIndex
CREATE INDEX "DriverProfile_career_idx" ON "DriverProfile"("career");

-- CreateIndex
CREATE INDEX "DriverProfile_officeLat_officeLng_idx" ON "DriverProfile"("officeLat", "officeLng");

-- CreateIndex
CREATE INDEX "Estimate_estimateRequestId_status_isDelete_idx" ON "Estimate"("estimateRequestId", "status", "isDelete");

-- CreateIndex
CREATE INDEX "EstimateRequest_isDesignated_designatedDriverId_status_isDe_idx" ON "EstimateRequest"("isDesignated", "designatedDriverId", "status", "isDelete");

-- CreateIndex
CREATE INDEX "FavoriteDriver_userId_createdAt_idx" ON "FavoriteDriver"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FavoriteDriver_driverId_createdAt_idx" ON "FavoriteDriver"("driverId", "createdAt");
