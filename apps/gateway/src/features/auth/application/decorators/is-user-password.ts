import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const containSmallLetter = /[a-z]/;
const containCapitalLetter = /[A-Z]/;
const containNumber = /[0-9]/;
const containSpecialCharacter = /[!#$%&'()*+,\-.\/:;<=>?@[\\\]^_{|}~]/;

export function IsUserPassword(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          if (value.length < 6 || value.length > 20) {
            return false;
          }

          if (!containSmallLetter.test(value)) {
            return false;
          }

          if (!containCapitalLetter.test(value)) {
            return false;
          }

          if (!containNumber.test(value)) {
            return false;
          }

          if (!containSpecialCharacter.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between 6 and 20 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character from ! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _\` { | } ~`;
        },
      },
    });
  };
}
