import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const FIRSTNAME_REGEX = /^[A-Za-zА-Яа-я]+$/;
const LASTNAME_LENGTH = {
  min: 1,
  max: 50,
};

export function IsLastName(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isLastName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value || typeof value !== 'string') {
            return false;
          }

          if (
            value.length < LASTNAME_LENGTH.min ||
            value.length > LASTNAME_LENGTH.max
          ) {
            return false;
          }

          if (!FIRSTNAME_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid first name (${LASTNAME_LENGTH.min}-${LASTNAME_LENGTH.max}  characters, only alphabetic characters are allowed)`;
        },
      },
    });
  };
}
