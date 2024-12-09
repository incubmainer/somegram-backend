import {
  ParseFilePipeBuilder,
  UnprocessableEntityException,
} from '@nestjs/common';

const SIZE_TYPE: string = 'expected size is';
const FILE_TYPE_TYPE: string = 'expected type is';
export const fileValidationPipe = (
  allowedMimeTypes: string[],
  maxSize: number,
  propertyName: string,
) => {
  const allowedMimeRegex = new RegExp(allowedMimeTypes.join('|'));

  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: allowedMimeRegex,
    })
    .addMaxSizeValidator({
      maxSize: maxSize * 1024 * 1024,
    })
    .build({
      exceptionFactory: (error: string) => {
        const errors = [];
        if (typeof error === 'string' && error.includes(FILE_TYPE_TYPE)) {
          errors.push({
            property: propertyName,
            constraints: {
              isFileType: `Invalid file type. Allowed only: ${allowedMimeRegex}`,
            },
          });
        }
        if (typeof error === 'string' && error.includes(SIZE_TYPE)) {
          errors.push({
            property: propertyName,
            constraints: {
              isFileSize: `The file is too large. Maximum size: ${maxSize} MB`,
            },
          });
        }

        throw new UnprocessableEntityException(errors);
      },
    });
};
