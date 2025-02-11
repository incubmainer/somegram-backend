import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const FIRSTNAME_REGEX = /^[A-Za-zА-Яа-я]+$/;
const FIRSTNAME_LENGTH = {
  min: 1,
  max: 50,
};

export function IsFirstName(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isFirstName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value || typeof value !== 'string') {
            return false;
          }

          if (
            value.length < FIRSTNAME_LENGTH.min ||
            value.length > FIRSTNAME_LENGTH.max
          ) {
            return false;
          }

          if (!FIRSTNAME_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid first name (${FIRSTNAME_LENGTH.min}-${FIRSTNAME_LENGTH.max} characters, only alphabetic characters are allowed)`;
        },
      },
    });
  };
}
