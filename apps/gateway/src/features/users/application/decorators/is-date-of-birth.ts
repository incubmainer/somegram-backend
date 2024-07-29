import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDateOfBirth(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateOfBirth',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!(value instanceof Date)) {
            return false;
          }

          const today = new Date();
          const thirteenYearsAgo = new Date();
          thirteenYearsAgo.setFullYear(today.getFullYear() - 13);

          return value <= thirteenYearsAgo;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date and the person must be older than 13 years`;
        },
      },
    });
  };
}
