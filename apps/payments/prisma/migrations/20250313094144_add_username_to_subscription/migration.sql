/*
  Warnings:

  - Added the required column `username` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "username" TEXT NOT NULL;
