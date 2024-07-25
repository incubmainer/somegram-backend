-- CreateTable
CREATE TABLE "UserGithubInfo" (
    "userId" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGithubInfo_userId_key" ON "UserGithubInfo"("userId");

-- CreateIndex
CREATE INDEX "UserGithubInfo_githubId_idx" ON "UserGithubInfo"("githubId");

-- AddForeignKey
ALTER TABLE "UserGithubInfo" ADD CONSTRAINT "UserGithubInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
