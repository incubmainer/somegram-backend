import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const CITY_NAME_REGEX = /^[\p{L}\s\-'.]+$/u;

export function IsCityName(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isCityName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          if (value.length < 1 || value.length > 100) {
            return false;
          }

          if (!CITY_NAME_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between 1 and 100 characters long and can include letters from any alphabet, spaces, hyphens, apostrophes, and periods.`;
        },
      },
    });
  };
}
