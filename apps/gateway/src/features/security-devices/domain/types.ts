export class SecurityDeviceCreateDto {
  userId: string;
  deviceId: string;
  ip: string;
  iat: Date;
  userAgent: string;
}
