import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '@app/paginator';
import { UserEntity } from '../../../../users/domain/user.entity';
import { FileType } from '../../../../../../../../libs/common/enums/file-type.enum';
import {
  LikeStatusEnum,
  PostWithLikeInfoModel,
  PostWithLikeInfoRawModel,
} from '../../../domain/types';
import { Injectable } from '@nestjs/common';

export class PostOwnerOutputDtoModel {
  @ApiProperty({
    description: 'User id',
    example: '2ffjk-fmrjc3nf-fn2',
    type: String,
  })
  userId: string;
  @ApiProperty({
    description: 'User name',
    example: 'Name',
    type: String,
  })
  username: string;
  @ApiProperty({
    description: 'User avatar url',
    example: 'https://avatar.com/',
    type: String,
  })
  avatarUrl: string | null;
}

class PostLastLikeOutputDtoModel {
  @ApiProperty()
  userId: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

class PostLikeOutputDtoModel {
  @ApiProperty()
  likeCount: number;

  @ApiProperty({ enum: [LikeStatusEnum.like, LikeStatusEnum.none] })
  myStatus: LikeStatusEnum;

  @ApiProperty({ type: PostLastLikeOutputDtoModel, isArray: true })
  lastLikeUser: PostLastLikeOutputDtoModel[];
}

export class PostOutputDtoModel {
  @ApiProperty({
    description: 'Post id',
    example: '223-4ffkr-321-f',
    type: String,
  })
  id: string;
  @ApiProperty({
    description: 'Post description',
    example: 'Some description',
    type: String,
    required: false,
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    description: 'Post created At',
    example: '2024-12-20 09:39:14',
    type: String,
  })
  createdAt: string;
  @ApiProperty({
    description: 'Post update At',
    example: '2024-12-20 09:39:14',
    type: String,
    required: false,
    nullable: true,
  })
  updatedAt: string | null;
  @ApiProperty({
    description: 'Post images',
    example: ['https://image.com/'],
    type: String,
    isArray: true,
  })
  images: string[];
  @ApiProperty({
    type: PostOwnerOutputDtoModel,
  })
  postOwnerInfo: PostOwnerOutputDtoModel;

  @ApiProperty({ type: PostLikeOutputDtoModel })
  like: PostLikeOutputDtoModel;
}

export class PostOutputDtoWithPaginationModel extends Pagination<PostOutputDtoModel> {
  @ApiProperty({
    type: PostOutputDtoModel,
    isArray: true,
  })
  items: PostOutputDtoModel;
}

export class PostOutputDto {
  id: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  images: string[];
  postOwnerInfo: {
    userId: string;
    username: string;
    avatarUrl: string | null;
  };
  like: {
    likeCount: number;
    myStatus: LikeStatusEnum;
    lastLikeUser: {
      userId: string;
      avatarUrl: string | null;
      profileUrl: string;
    }[];
  };

  constructor(init: Partial<PostOutputDto>) {
    Object.assign(this, init);
  }
}

export const postToOutputMapper = (
  post: PostWithLikeInfoModel,
  user: UserEntity,
  avatar: FileType | null,
  images: FileType[],
): PostOutputDto => {
  return new PostOutputDto({
    id: post.id,
    description: post.description ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
    images: images.map((i) => i.url),
    postOwnerInfo: {
      userId: user.id,
      username: user.username,
      avatarUrl: avatar ? avatar.url : null,
    },
    like: {
      likeCount: post._count?.LikesPost || 0,
      myStatus: post.myStatus || LikeStatusEnum.none,
      lastLikeUser: post.lastLikeUser || [],
    },
  });
};

@Injectable()
export class PostRawOutputModelMapper {
  mapPost(post: PostWithLikeInfoRawModel): PostOutputDto {
    return {
      id: post.id,
      description: post.description ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
      images: post.postImages.map((i) => i.url),
      postOwnerInfo: {
        userId: post.userId,
        username: post.username,
        avatarUrl: post.ownerAvatarUrl ? post.ownerAvatarUrl : null,
      },
      like: {
        likeCount: post.likes || 0,
        myStatus: post.myStatus || LikeStatusEnum.none,
        lastLikeUser: post.lastLikeUser || [],
      },
    };
  }

  mapPosts(posts: PostWithLikeInfoRawModel[]): PostOutputDto[] {
    return posts.map((post) => this.mapPost(post));
  }
}
