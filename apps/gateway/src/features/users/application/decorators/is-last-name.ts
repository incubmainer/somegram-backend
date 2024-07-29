import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const FIRSTNAME_REGEX = /^[A-Za-zА-Яа-я]+$/;

export function IsLastName(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'isLastName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || typeof value !== 'string') {
            return false;
          }

          if (value.length < 1 || value.length > 50) {
            return false;
          }

          if (!FIRSTNAME_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid first name (1-50 characters, only alphabetic characters are allowed)`;
        },
      },
    });
  };
}
