import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// Ensure the password contains at least one lowercase letter
const containsLowercase = '(?=.*[a-z])';

// Ensure the password contains at least one uppercase letter
const containsUppercase = '(?=.*[A-Z])';

// Ensure the password contains at least one digit
const containsDigit = '(?=.*[0-9])';

// Ensure the password contains at least one special character from the specified set
const containsSpecialChar = "(?=.*[!#$%&'()*+,.\\-/:;<=>?@[\\]^_{|}~])";

// Allowed characters in the password (letters, digits, and specified special characters)
const allowedCharacters = "[A-Za-z0-9!#$%&'()*+,.\\-/:;<=>?@[\\]^_{|}~]*";

// Combine all conditions into a single regular expression
const passwordRegex = new RegExp(
  `^${containsLowercase}${containsUppercase}${containsDigit}${containsSpecialChar}${allowedCharacters}$`,
);

export function IsUserPassword(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
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

          // Check if the length is between 6 and 20 characters
          if (value.length < 6 || value.length > 20) {
            return false;
          }

          // Validate the content of the password using the regular expression
          return passwordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between 6 and 20 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character from ! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _\` { | } ~`;
        },
      },
    });
  };
}
