-- CreateTable
CREATE TABLE "LikesComment" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LikesComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikesPost" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LikesPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LikesComment" ADD CONSTRAINT "LikesComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesComment" ADD CONSTRAINT "LikesComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesPost" ADD CONSTRAINT "LikesPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UserPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesPost" ADD CONSTRAINT "LikesPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
