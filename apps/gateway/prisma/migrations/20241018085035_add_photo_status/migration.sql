/*
  Warnings:

  - Added the required column `status` to the `PostPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostPhoto" ADD COLUMN     "status" TEXT NOT NULL;
