/*
  Warnings:

  - You are about to drop the column `userId` on the `History` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_userId_fkey";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "userId";
