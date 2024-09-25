import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const ABOUT_REGEX = /^[0-9A-Za-zА-Яа-я.,!?@#&()\-+=$%^&*_\s]+$/;
const ABOUT_LENGTH = {
  min: 0,
  max: 200,
};

export function IsAbout(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isAbout',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          if (
            value.length < ABOUT_LENGTH.min ||
            value.length > ABOUT_LENGTH.max
          ) {
            return false;
          }

          if (!ABOUT_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between ${ABOUT_LENGTH.min} and ${ABOUT_LENGTH.max} characters long and can include letters, numbers, and special characters.`;
        },
      },
    });
  };
}
