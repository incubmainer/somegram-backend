import { User, UserPost } from '@prisma/gateway';
import { FileType } from '../../../../../../../../libs/common/enums/file-type.enum';

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
  post: {
    id: UserPost['id'];
    userId: UserPost['userId'];
    createdAt: UserPost['createdAt'];
    updatedAt: UserPost['updatedAt'] | null;
    description?: UserPost['description'] | null;
  },
  user: User,
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
