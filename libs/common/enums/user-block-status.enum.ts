import { registerEnumType } from '@nestjs/graphql';

export enum UserBlockStatus {
  ALL = 'all',
  BLOCKED = 'blocked',
  UNBLOCKED = 'unblocked',
}
registerEnumType(UserBlockStatus, {
  name: 'UserBlockStatus',
});
