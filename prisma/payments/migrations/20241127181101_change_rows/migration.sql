/*
  Warnings:

  - You are about to drop the column `paymentCount` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionType` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `subscriptionType` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "subscriptionType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "paymentCount",
DROP COLUMN "price",
DROP COLUMN "subscriptionType";
