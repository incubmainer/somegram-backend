/*
  Warnings:

  - Added the required column `paymentSystemPaymentId` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "paymentSystemPaymentId" TEXT NOT NULL;
