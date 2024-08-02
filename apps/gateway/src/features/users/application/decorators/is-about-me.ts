import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const ABOUT_REGEX = /^[0-9A-Za-zА-Яа-я.,!?@#&()\-+=$%^&*_\s]+$/;

export function IsAboutMe(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAboutMe',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          if (value.length < 0 || value.length > 200) {
            return false;
          }

          if (!ABOUT_REGEX.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between 0 and 200 characters long and can include letters, numbers, and special characters.`;
        },
      },
    });
  };
}
