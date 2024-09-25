import { User } from '@prisma/gateway';

export class ProfileInfoOutputDto {
  userName: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  about: string | null;
  city: string | null;
  avatar?: {
    url: string | null;
  };

  constructor(data?: Partial<ProfileInfoOutputDto>) {
    Object.assign(this, data);
  }

  addAvatar(url: string) {
    this.avatar = { url };
  }
}

export const userProfileInfoMapper = (user: User): ProfileInfoOutputDto => {
  return new ProfileInfoOutputDto({
    email: user.email,
    userName: user.username,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    about: user.about ?? null,
    city: user.city ?? null,
  });
};
