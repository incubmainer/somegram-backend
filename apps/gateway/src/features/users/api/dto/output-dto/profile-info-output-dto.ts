import { User } from '@prisma/gateway';
import { ApiProperty } from '@nestjs/swagger';

export class UserCountOutputDto {
  @ApiProperty({
    description: 'Number of users',
    example: 0,
    type: Number,
  })
  totalCount: number;

  constructor(count: number) {
    this.totalCount = count;
  }
}

class ProfileAvatarInfoOutputDtoModel {
  @ApiProperty({
    description: 'User avatar url',
    example: 'https://localhost:3000/avatar/1/avatar.png',
    type: String,
    nullable: true,
  })
  url: string | null;
}

export class ProfileInfoOutputDtoModel {
  @ApiProperty({
    description: 'Email',
    example: 'email@email.com',
    type: String,
  })
  email: string;
  @ApiProperty({
    description: 'Username',
    example: 'Username',
    type: String,
  })
  userName: string;
  @ApiProperty({
    description: 'User first name',
    example: 'Ivan',
    type: String,
    nullable: true,
  })
  firstName: string | null;
  @ApiProperty({
    description: 'User last name',
    example: 'Ivanov',
    type: String,
    nullable: true,
  })
  lastName: string | null;
  @ApiProperty({
    description: 'User`s date of birth',
    example: '2024-12-09T14:34:56.123Z',
    type: String,
    nullable: true,
  })
  dateOfBirth: string | null;
  @ApiProperty({
    description: 'User information',
    example: 'This is user',
    type: String,
    nullable: true,
  })
  about: string | null;
  @ApiProperty({
    description: 'User city info',
    example: 'Vilnius',
    type: String,
    nullable: true,
  })
  city: string | null;
  @ApiProperty({
    description: 'User country info',
    example: 'Lithuania',
    type: String,
    nullable: true,
  })
  country: string | null;
  @ApiProperty({
    type: ProfileAvatarInfoOutputDtoModel,
  })
  avatar: ProfileAvatarInfoOutputDtoModel;
}

export class ProfilePublicInfoOutputDtoModel {
  @ApiProperty({
    description: 'User id',
    example: '293-dkrjcn-fi443',
    type: String,
  })
  id: string;
  @ApiProperty({
    description: 'Username',
    example: 'Username',
    type: String,
  })
  userName: string;
  @ApiProperty({
    description: 'User information',
    example: 'This is user',
    type: String,
    nullable: true,
  })
  about: string | null;
  @ApiProperty({
    type: ProfileAvatarInfoOutputDtoModel,
  })
  avatar: ProfileAvatarInfoOutputDtoModel;

  constructor(data?: Partial<ProfileInfoOutputDto>) {
    Object.assign(this, data);
  }
}

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
    avatar: { url: avatarUrl ? avatarUrl : null },
  });
};

export const userPublicProfileInfoMapper = (
  user: User,
  avatarUrl?: string | null,
): ProfilePublicInfoOutputDtoModel => {
  return new ProfilePublicInfoOutputDtoModel({
    id: user.id,
    userName: user.username,
    about: user.about ?? null,
    avatar: {
      url: avatarUrl ? avatarUrl : null,
    },
  });
};
