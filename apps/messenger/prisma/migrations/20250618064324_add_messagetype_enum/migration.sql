/*
  Warnings:

  - The `messageType` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'voice', 'file');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "messageType",
ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'text';
