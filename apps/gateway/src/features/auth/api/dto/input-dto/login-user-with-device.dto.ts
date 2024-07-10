import { User } from '@prisma/gateway';
export class LoginUserWithDeviceDto {
  constructor(
    public user: User,
    public ip: string,
    public title: string,
  ) {}
}
