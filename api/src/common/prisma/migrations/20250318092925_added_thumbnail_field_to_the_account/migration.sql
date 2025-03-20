/*
  Warnings:

  - A unique constraint covering the columns `[thumbnail]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "thumbnail" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_thumbnail_key" ON "Account"("thumbnail");
