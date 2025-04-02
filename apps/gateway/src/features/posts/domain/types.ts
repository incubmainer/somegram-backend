import { UserPost } from '@prisma/gateway';
import { UserEntity } from '../../users/domain/user.entity';
import { FileType } from '../../../../../../libs/common/enums/file-type.enum';
export class CreatedPostDto {
  createdAt: Date;
  userId: string;
  description: string;
}

export class UserPostWithOwnerInfo implements UserPost {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  User: UserEntity;
}

export enum LikeStatusEnum {
  like = 'like',
  dislike = 'dislike',
  none = 'none',
}

export class CreatedPostCommentDto {
  commentatorId: string;
  postId: string;
  text: string;
  createdAt: Date;
  answerForCommentId: string | null;
}

export class PostCommentRawModel {
  id: string;
  text: string;
  commentatorId: string;
  postId: string;
  createdAt: Date;
  username: string;
  myStatus: LikeStatusEnum;
  likes: number;
  dislikes: number;
  answersCount: number;
  avatar: FileType | null;
}

export class CommentAnswerRawModel extends PostCommentRawModel {
  answerForCommentId: string;
}

export class CreatePostCommentLikeDto {
  userId: string;
  status: LikeStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  commentId: string;
}

export class CreatePostLikeDto {
  userId: string;
  status: LikeStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
}
