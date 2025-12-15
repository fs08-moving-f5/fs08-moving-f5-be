/*
  Warnings:

  - A unique constraint covering the columns `[estimateRequestId,driverId]` on the table `Estimate` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `phone` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Estimate_estimateRequestId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
ADD COLUMN     "phone" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_estimateRequestId_driverId_key" ON "Estimate"("estimateRequestId", "driverId");
