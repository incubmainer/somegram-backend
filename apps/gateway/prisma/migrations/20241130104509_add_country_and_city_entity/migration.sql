-- CreateTable
CREATE TABLE "CountryCatalog" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CountryCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityCatalog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "CityCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryCatalog_code_key" ON "CountryCatalog"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CityCatalog_countryId_name_key" ON "CityCatalog"("countryId", "name");

-- AddForeignKey
ALTER TABLE "CityCatalog" ADD CONSTRAINT "CityCatalog_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
