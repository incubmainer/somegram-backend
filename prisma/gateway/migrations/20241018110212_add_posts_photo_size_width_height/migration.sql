/*
  Warnings:

  - Added the required column `height` to the `PostPhoto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `PostPhoto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `PostPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostPhoto" ADD COLUMN     "height" TEXT NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL,
ADD COLUMN     "width" TEXT NOT NULL;
