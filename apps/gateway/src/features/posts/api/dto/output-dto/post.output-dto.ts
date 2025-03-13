import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '@app/paginator';
import { UserEntity } from '../../../../users/domain/user.entity';
import { PostEntity } from '../../../domain/post.entity';
import { FileType } from '../../../../../../../../libs/common/enums/file-type.enum';

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
  avatarUrl: string;
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
    avatarUrl: string;
  };

  constructor(init: Partial<PostOutputDto>) {
    Object.assign(this, init);
  }
}

export const postToOutputMapper = (
  post: PostEntity,
  user: UserEntity,
  avatar: FileType,
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
      avatarUrl: avatar.url,
    },
  });
};
