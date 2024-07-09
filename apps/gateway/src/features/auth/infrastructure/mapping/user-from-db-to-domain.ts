import { User as DomainUser } from '../../domain/user';
import { Prisma } from '@prisma/gateway';
import { UserId } from '../../domain/value-objects/user-id';
import { Username } from '../../domain/value-objects/username';
import { Email } from '../../domain/value-objects/email';
import { HashPassword } from '../../domain/value-objects/hash-password';
import { UserCreatedAt } from '../../domain/value-objects/user-created-at';
import { UserUpdatedAt } from '../../domain/value-objects/user-updated-at';
import { ConfirmationToken } from '../../domain/value-objects/confirmation-token';
import { UserConfirmationTokenExpiredAt } from '../../domain/value-objects/user-confirmation-token-expired-at';
import { UserConfirmationTokenCreatedAt } from '../../domain/value-objects/user-confirmation-token-created-at';
import { ResetPasswordCode } from '../../domain/value-objects/reset-password-code';
import { UserResetPasswordCodeExpiredAt } from '../../domain/value-objects/user-reset-password-code-expired-at';
import { UserResetPasswordCodeCreatedAt } from '../../domain/value-objects/user-reset-password-code-created-at';

type FullUserType = Prisma.UserGetPayload<{
  include: {
    confirmationToken: true;
    resetPasswordCode: true;
  };
}>;

export const userFromDbToDomain = (dbUser: FullUserType): DomainUser => {
  return DomainUser.create({
    id: new UserId(dbUser.id),
    username: new Username(dbUser.username),
    email: new Email(dbUser.email),
    hashPassword: new HashPassword(dbUser.hashPassword),
    createdAt: new UserCreatedAt(dbUser.createdAt),
    updatedAt: dbUser.updatedAt ? new UserUpdatedAt(dbUser.updatedAt) : null,
    isConfirmed: dbUser.isConfirmed,
    confirmationToken: dbUser.confirmationToken
      ? new ConfirmationToken(dbUser.confirmationToken.token)
      : null,
    confirmationTokenExpiredAt: dbUser.confirmationToken.expiredAt
      ? new UserConfirmationTokenExpiredAt(dbUser.confirmationToken.expiredAt)
      : null,
    confirmationTokenCreatedAt: dbUser.confirmationToken.createdAt
      ? new UserConfirmationTokenCreatedAt(dbUser.confirmationToken.createdAt)
      : null,
    resetPasswordCode: dbUser.resetPasswordCode
      ? new ResetPasswordCode(dbUser.resetPasswordCode.code)
      : null,
    resetPasswordCodeExpiredAt: dbUser.resetPasswordCode.expiredAt
      ? new UserResetPasswordCodeExpiredAt(dbUser.resetPasswordCode.expiredAt)
      : null,
    resetPasswordCodeCreatedAt: dbUser.resetPasswordCode.createdAt
      ? new UserResetPasswordCodeCreatedAt(dbUser.resetPasswordCode.createdAt)
      : null,
  });
};
