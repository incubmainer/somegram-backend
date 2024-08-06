// import {
//   registerDecorator,
//   ValidationOptions,
//   ValidationArguments,
// } from 'class-validator';
// import { Buffer } from 'buffer';

// const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

// export function IsPostPhoto(validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       name: 'isPostPhoto',
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       validator: {
//         async validate(value: any, args: ValidationArguments) {
//           console.log('🚀 ~ validate ~ value:', value);
//           if (!Buffer.isBuffer(value.buffer)) {
//             return false;
//           }

//           if (value.length > MAX_SIZE) {
//             return false;
//           }

//           return true;
//         },
//         defaultMessage(args: ValidationArguments) {
//           return `${args.property} must be a buffer less than 20 MB and a valid image (JPEG or PNG).`;
//         },
//       },
//     });
//   };
// }

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

@ValidatorConstraint({ async: false })
export class IsPostPhotoConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!Buffer.isBuffer(value)) {
      return false;
    }
    if (value.length > MAX_SIZE) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a buffer less than 20 MB.`;
  }
}

export function IsPostPhoto(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPostPhoto',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsPostPhotoConstraint,
    });
  };
}
