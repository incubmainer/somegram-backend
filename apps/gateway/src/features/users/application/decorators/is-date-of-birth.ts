import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDateOfBirth(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isDateOfBirth',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          const dateFormatRegex = /^\d{2}\.\d{2}\.\d{4}$/;
          if (!dateFormatRegex.test(value)) {
            return false;
          }

          const [day, month, year] = value.split('.').map(Number);
          const dateOfBirth = new Date(year, month - 1, day);

          if (isNaN(dateOfBirth.getTime())) {
            return false;
          }

          const today = new Date();
          const thirteenYearsAgo = new Date();
          thirteenYearsAgo.setFullYear(today.getFullYear() - 13);

          return dateOfBirth <= thirteenYearsAgo;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date in the format dd.mm.yyyy and the person must be older than 13 years`;
        },
      },
    });
  };
}
