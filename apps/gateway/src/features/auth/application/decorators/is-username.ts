import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const USERNAME_REGEX = /^[0-9A-Za-z_-]+$/;

export function IsUsername(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUsername',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || typeof value !== 'string') {
            return false;
          }

          // Check length
          if (value.length < 6 || value.length > 30) {
            return false;
          }

          // Check characters using regex
          if (!USERNAME_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid username (6-30 characters, alphanumeric, underscore, or dash)`;
        },
      },
    });
  };
}
