-- CreateTable
CREATE TABLE "PostsPhotos" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UserPosts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PostsPhotos_postId_key" ON "PostsPhotos"("postId");

-- CreateIndex
CREATE INDEX "PostsPhotos_photoKey_idx" ON "PostsPhotos"("photoKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserPosts_id_key" ON "UserPosts"("id");

-- AddForeignKey
ALTER TABLE "PostsPhotos" ADD CONSTRAINT "PostsPhotos_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UserPosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPosts" ADD CONSTRAINT "UserPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
