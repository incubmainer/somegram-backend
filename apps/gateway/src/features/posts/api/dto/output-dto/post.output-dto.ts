import { PostPhoto, User, UserPost } from '@prisma/gateway';

export class PostOutputDto {
  id: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  images: string[];
  postOwnerInfo: {
    userId: string;
    username: string;
    about: string;
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
    postPhotos?: PostPhoto[];
  },
  user: User,
  avatarUrl: string,
  images: string[],
): PostOutputDto => {
  return new PostOutputDto({
    id: post.id,
    description: post.description ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt ? post.updatedAt.toISOString() : null,
    images: images,
    postOwnerInfo: {
      userId: user.id,
      username: user.username,
      about: user.about,
      avatarUrl: avatarUrl,
    },
  });
};
