/*
  Warnings:

  - The primary key for the `CityCatalog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CountryCatalog` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CityCatalog" DROP CONSTRAINT "CityCatalog_countryId_fkey";

-- AlterTable
ALTER TABLE "CityCatalog" DROP CONSTRAINT "CityCatalog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CityCatalog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CityCatalog_id_seq";

-- AlterTable
ALTER TABLE "CountryCatalog" DROP CONSTRAINT "CountryCatalog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CountryCatalog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CountryCatalog_id_seq";

-- AddForeignKey
ALTER TABLE "CityCatalog" ADD CONSTRAINT "CityCatalog_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
