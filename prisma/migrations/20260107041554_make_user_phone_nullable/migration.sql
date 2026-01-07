/*
  Warnings:

  - Made the column `phone` on table `User` optional.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;
