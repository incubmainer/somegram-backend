import {
  ParseFilePipeBuilder,
  UnprocessableEntityException,
} from '@nestjs/common';

const SIZE_TYPE: string = 'expected size is';
const FILE_TYPE_TYPE: string = 'expected type is';
const REQUIRED_FILE_TYPE: string = 'is required';
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

        if (typeof error === 'string' && error.includes(REQUIRED_FILE_TYPE)) {
          errors.push({
            property: propertyName,
            constraints: {
              [propertyName]: `The file is required.`,
            },
          });
        }

        throw new UnprocessableEntityException(errors);
      },
    });
};

export const filesValidationPipe = (
  allowedMimeTypes: string[],
  maxSize: number,
  minCount: number,
  maxCount: number,
) => {
  const allowedMimeRegex = new RegExp(allowedMimeTypes.join('|'));

  return {
    transform: (files: Express.Multer.File[]) => {
      const errors = [];

      if (!files || files.length < minCount || files.length > maxCount)
        throw new UnprocessableEntityException({
          property: `files`,
          constraints: {
            isFileType: `Photos are required. Minimum quantity: ${minCount}, Maximum quantity: ${maxCount}`,
          },
        });

      files.forEach((file: Express.Multer.File, index: number): void => {
        try {
          if (!allowedMimeRegex.test(file.mimetype)) {
            errors.push({
              property: file.originalname,
              constraints: {
                isFileType: `Invalid file type. Allowed only: ${allowedMimeRegex}`,
              },
            });
          }

          if (file.size > maxSize * 1024 * 1024) {
            errors.push({
              property: file.originalname,
              constraints: {
                isFileSize: `The file is too large. Maximum size: ${maxSize} MB`,
              },
            });
          }
        } catch (error) {
          errors.push({
            property: file.originalname,
            constraints: {
              unexpected: `Unexpected error during file validation: ${error.message}`,
            },
          });
        }
      });

      if (errors.length > 0) {
        throw new UnprocessableEntityException(errors);
      }

      return files;
    },
  };
};
