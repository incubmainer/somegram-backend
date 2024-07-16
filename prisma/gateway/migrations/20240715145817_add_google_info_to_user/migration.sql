-- CreateTable
CREATE TABLE "UserGoogleInfo" (
    "userId" TEXT NOT NULL,
    "sub" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "picture" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoogleInfo_userId_key" ON "UserGoogleInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGoogleInfo_sub_key" ON "UserGoogleInfo"("sub");

-- AddForeignKey
ALTER TABLE "UserGoogleInfo" ADD CONSTRAINT "UserGoogleInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
