/*
  Warnings:

  - You are about to drop the column `email_verified` on the `UserGoogleInfo` table. All the data in the column will be lost.
  - You are about to drop the column `family_name` on the `UserGoogleInfo` table. All the data in the column will be lost.
  - You are about to drop the column `given_name` on the `UserGoogleInfo` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `UserGoogleInfo` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `UserGoogleInfo` table. All the data in the column will be lost.
  - Added the required column `emailVerified` to the `UserGoogleInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserGoogleInfo" DROP COLUMN "email_verified",
DROP COLUMN "family_name",
DROP COLUMN "given_name",
DROP COLUMN "name",
DROP COLUMN "picture",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL;
