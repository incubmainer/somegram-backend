import { User } from '@prisma/gateway';

export class ProfileInfoOutputDto {
  id: string;
  userName: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  about: string | null;
  city: string | null;
  country: string | null;
  avatar?: {
    url: string | null;
  };

  constructor(data?: Partial<ProfileInfoOutputDto>) {
    Object.assign(this, data);
  }
}

export const userProfileInfoMapper = (
  user: User,
  avatarUrl?: string | null,
): ProfileInfoOutputDto => {
  return new ProfileInfoOutputDto({
    email: user.email,
    userName: user.username,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    about: user.about ?? null,
    city: user.city ?? null,
    country: user.country ?? null,
    avatar: avatarUrl ? { url: avatarUrl } : undefined,
  });
};

export const userPublicProfileInfoMapper = (
  user: User,
  avatarUrl?: string | null,
): ProfileInfoOutputDto => {
  return new ProfileInfoOutputDto({
    id: user.id,
    userName: user.username,
    about: user.about ?? null,
    avatar: {
      url: avatarUrl ? avatarUrl : null,
    },
  });
};
