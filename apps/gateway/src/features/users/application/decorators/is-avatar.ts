import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Buffer } from 'buffer';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function IsAvatar(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isAvatar',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any) {
          if (!Buffer.isBuffer(value)) {
            return false;
          }

          if (value.length > MAX_SIZE) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a buffer less than 10 MB and a valid image (JPEG or PNG).`;
        },
      },
    });
  };
}
