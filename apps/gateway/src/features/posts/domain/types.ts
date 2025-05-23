import { UserPost } from '@prisma/gateway';
import { UserEntity } from '../../users/domain/user.entity';
import { FileType } from '../../../../../../libs/common/enums/file-type.enum';
export class CreatedPostDto {
  createdAt: Date;
  userId: string;
  description: string;
}

class PostLastLikeModel {
  userId: string;
}

class PostLikeCountModel {
  LikesPost: number;
}

export class UserPostWithOwnerInfo implements UserPost {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  User: UserEntity;
  LikesPost: PostLastLikeModel[]; // as Last likes
  _count: PostLikeCountModel; // as count likes
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

class PostWithLikeInfoUserModel {
  username: string;
}

class PostWithLikeInfoLastLikeModel {
  userId: string;
}

class PostWithLikeInfoLastLikeCountModel {
  LikesPost: number;
}

class PostLastLikeUserInfoModel {
  userId: string;
  avatarUrl: string | null;
  profileUrl: string;
}

export class PostWithLikeInfoModel {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  description: string | null;
  userId: string;
  User: PostWithLikeInfoUserModel; // post owner
  LikesPost: PostWithLikeInfoLastLikeModel[]; // last 3 likes user ids
  _count: PostWithLikeInfoLastLikeCountModel; // total like count for post

  ownerAvatarUrl?: string | null;
  myStatus?: LikeStatusEnum;
  lastLikeUser?: PostLastLikeUserInfoModel[];
}

export class PostWithLikeInfoRawModel {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
  description: string | null;
  username: string;
  myStatus: LikeStatusEnum;
  likes: number; // total like count for post
  lastLikedUserIds: string[]; // last 3 likes user ids

  ownerAvatarUrl?: string | null;
  postImages?: FileType[];
  lastLikeUser?: PostLastLikeUserInfoModel[];
}

export class AdminPostCommentRawModel {
  id: string;
  text: string;
  commentatorId: string;
  postId: string;
  createdAt: Date;
  username: string;
  likes: number;
  dislikes: number;
  answersCount: number;
  avatar: FileType | null;
}

export class AdminCommentAnswerRawModel extends AdminPostCommentRawModel {
  answerForCommentId: string;
}
