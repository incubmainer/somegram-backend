import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const allowedMimetypes = ['image/jpeg', 'image/png'];

export function IsAvatarMimetype(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAvatarMimetype',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          return allowedMimetypes.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid MIME type: ${allowedMimetypes.join(', ')}`;
        },
      },
    });
  };
}
