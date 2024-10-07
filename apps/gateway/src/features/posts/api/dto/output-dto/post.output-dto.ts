import { User, UserPost } from '@prisma/gateway';

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
  post: UserPost,
  user: User,
  avatarUrl: string,
  images: string[],
): PostOutputDto => {
  return new PostOutputDto({
    id: post.id,
    description: post.description ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString() ?? null,
    images: images,
    postOwnerInfo: {
      userId: user.id,
      username: user.username,
      avatarUrl: avatarUrl,
    },
  });
};
