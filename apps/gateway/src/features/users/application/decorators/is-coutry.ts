import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const COUNTRY_NAME_REGEX = /^[\p{L}\s\-'.]+$/u;
const COUNTRY_LENGTH = {
  min: 1,
  max: 100,
};

export function IsCountry(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isCountry',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          if (
            value.length < COUNTRY_LENGTH.min ||
            value.length > COUNTRY_LENGTH.max
          ) {
            return false;
          }

          if (!COUNTRY_NAME_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between ${COUNTRY_LENGTH.min} and ${COUNTRY_LENGTH.max} characters long and can include letters from any alphabet, spaces, hyphens, apostrophes, and periods.`;
        },
      },
    });
  };
}
