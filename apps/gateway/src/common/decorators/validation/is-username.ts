import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const USERNAME_REGEX = /^[0-9A-Za-z_-]+$/;
const USERNAME_LENGTH = {
  min: 6,
  max: 30,
};

export function IsUsername(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isUsername',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value || typeof value !== 'string') {
            return false;
          }
          if (
            value.length < USERNAME_LENGTH.min ||
            value.length > USERNAME_LENGTH.max
          ) {
            return false;
          }
          if (!USERNAME_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid username (${USERNAME_LENGTH.min}-${USERNAME_LENGTH.max} characters, alphanumeric, underscore, or dash)`;
        },
      },
    });
  };
}
