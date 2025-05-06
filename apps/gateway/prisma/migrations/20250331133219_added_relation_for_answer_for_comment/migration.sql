-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "answerForCommentId" TEXT;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_answerForCommentId_fkey" FOREIGN KEY ("answerForCommentId") REFERENCES "PostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
