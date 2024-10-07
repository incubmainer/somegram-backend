import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png'];

@ValidatorConstraint({ name: 'isValidFile', async: false })
export class IsValidFileConstraint implements ValidatorConstraintInterface {
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  validate(file: Express.Multer.File, args: ValidationArguments) {
    if (!file) return false;
    return (
      file.size <= this.maxSize * 1024 * 1024 &&
      ALLOWED_MIMETYPES.includes(file.mimetype)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `File must be present, less than ${this.maxSize} MB, and of type: ${ALLOWED_MIMETYPES.join(', ')}`;
  }
}

export function IsValidFile(
  maxSize: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isValidFile',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: new IsValidFileConstraint(maxSize),
    });
  };
}
