/*
  Warnings:

  - A unique constraint covering the columns `[thumbNail]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "thumbNail" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_thumbNail_key" ON "Account"("thumbNail");
