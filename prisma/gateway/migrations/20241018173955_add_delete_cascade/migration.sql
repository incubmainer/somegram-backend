-- DropForeignKey
ALTER TABLE "PostPhoto" DROP CONSTRAINT "PostPhoto_postId_fkey";

-- AddForeignKey
ALTER TABLE "PostPhoto" ADD CONSTRAINT "PostPhoto_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UserPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
