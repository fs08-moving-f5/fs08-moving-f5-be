/*
  Warnings:

  - A unique constraint covering the columns `[estimateRequestId,driverId]` on the table `Estimate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Estimate_estimateRequestId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_estimateRequestId_driverId_key" ON "Estimate"("estimateRequestId", "driverId");
