import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export function FillProfileSwagger() {
  return applyDecorators(
    ApiTags('Users'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Fill User Profile' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Profile filled successfully',
      schema: {
        example: {
          message: 'Profile filled successfully',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User not found or not authorized',
      schema: {
        example: {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Validation error',
      schema: {
        example: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          errors: [
            {
              property: 'username',
              constraints: {
                isUsername:
                  'username must be a valid username (6-30 characters, alphanumeric, underscore, or dash)',
              },
            },
            {
              property: 'firstName',
              constraints: {
                isFirstName:
                  'firstName must be a valid first name (1-50 characters, only alphabetic characters are allowed)',
              },
            },
            {
              property: 'lastName',
              constraints: {
                isLastName:
                  'lastName must be a valid first name (1-50 characters, only alphabetic characters are allowed)',
              },
            },
            {
              property: 'dateOfBirth',
              constraints: {
                isDateOfBirth:
                  'dateOfBirth must be a valid date in the format dd.mm.yyyy and the person must be older than 13 years',
              },
            },
            {
              property: 'aboutMe',
              constraints: {
                isAboutMe:
                  'aboutMe must be between 0 and 200 characters long and can include letters, numbers, and special characters.',
              },
            },
            {
              property: 'city',
              constraints: {
                isCityName:
                  'city must be between 1 and 100 characters long and can include letters from any alphabet, spaces, hyphens, apostrophes, and periods.',
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Transaction error',
      schema: {
        example: {
          status: HttpStatus.BAD_REQUEST,
          error: 'Transaction error',
        },
      },
    }),
  );
}
