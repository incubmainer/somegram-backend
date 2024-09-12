import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function RegistrationSwagger() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'User Registration' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Registration success',
      schema: {
        example: {
          statusCode: HttpStatus.OK,
          message: 'Registration successful',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Email or Username already exists',
      schema: {
        example: {
          error: 'registration_failed',
          message:
            'Registration failed due to conflict with existing email or username.',
          details: {
            email: 'Email address is already in use.',
            username: 'Username is already taken.',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Transaction error',
      schema: {
        example: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Transaction error',
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
                IsUsername: `username must be a valid username (6-30 characters, alphanumeric, underscore, or dash)`,
              },
            },
            {
              property: 'email',
              constraints: {
                isEmail: 'email must be an email',
              },
            },
            {
              property: 'password',
              constraints: {
                length: `password must be between 6 and 20 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character from ! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _\` { | } ~`,
              },
            },
          ],
        },
      },
    }),
  );
}
