/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "updatedAt",
ADD COLUMN     "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dateOfPayment" TIMESTAMP(3),
ADD COLUMN     "endDateOfSubscription" TIMESTAMP(3);
