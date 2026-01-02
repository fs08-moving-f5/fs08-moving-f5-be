/*
  Warnings:

  - The `career` column on the `DriverProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DriverProfile" DROP COLUMN "career",
ADD COLUMN     "career" INTEGER;
