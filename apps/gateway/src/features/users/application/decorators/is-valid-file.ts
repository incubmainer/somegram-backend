import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { FileValidator } from '@nestjs/common';

const MAX_SIZE = 10; // 10 MB in bytes
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png'];

@ValidatorConstraint({ name: 'isValidFile', async: false })
export class IsValidFileConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File, args: ValidationArguments) {
    if (!file) return false;
    return (
      file.size <= MAX_SIZE * 1024 * 1024 &&
      ALLOWED_MIMETYPES.includes(file.mimetype)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `File must be present, less than ${MAX_SIZE} MB, and of type: ${ALLOWED_MIMETYPES.join(', ')}`;
  }
}

export function IsValidFile(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isValidFile',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidFileConstraint,
    });
  };
}

export class CustomFileValidator extends FileValidator<{
  maxSize: number;
  allowedMimetypes: string[];
}> {
  buildErrorMessage(file?: Express.Multer.File): string {
    if (!file) return 'File is required';
    if (file.size > this.validationOptions.maxSize) {
      return `File size must be less than ${this.validationOptions.maxSize} MB`;
    }
    if (!this.validationOptions.allowedMimetypes.includes(file.mimetype)) {
      return `File type must be one of: ${this.validationOptions.allowedMimetypes.join(', ')}`;
    }
    return '';
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false;
    return (
      file.size <= this.validationOptions.maxSize &&
      this.validationOptions.allowedMimetypes.includes(file.mimetype)
    );
  }
}
