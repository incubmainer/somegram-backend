import { User as DomainUser, UserProps } from '../../domain/user';
import { Prisma } from '@prisma/gateway';

export const userFromDomainToDbCreate = (
  domainUser: DomainUser,
): Prisma.UserCreateInput => {
  const userProps: UserProps = Reflect.get(domainUser, 'props');
  return {
    id: userProps.id.value,
    username: userProps.username.value,
    email: userProps.email.value,
    hashPassword: userProps.hashPassword.value,
    createdAt: userProps.createdAt.value,
    updatedAt: userProps.updatedAt ? userProps.updatedAt.value : null,
    isConfirmed: userProps.isConfirmed,
    confirmationToken: userProps.confirmationToken
      ? {
        create: {
          token: userProps.confirmationToken.value,
          expiredAt: userProps.confirmationTokenExpiredAt.value,
          createdAt: userProps.confirmationTokenCreatedAt.value,
        },
      }
      : undefined,
    resetPasswordCode: userProps.resetPasswordCode
      ? {
        create: {
          code: userProps.resetPasswordCode.value,
          expiredAt: userProps.resetPasswordCodeExpiredAt.value,
          createdAt: userProps.resetPasswordCodeCreatedAt.value,
        },
      }
      : undefined,
  };
};
