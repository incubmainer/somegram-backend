import {
  Controller,
  HttpStatus,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { UploadAvatarSwagger } from './swagger/upload-avatar.swagger';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UploadAvatarCommand } from '../application/use-cases/upload-avatar.use-case';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { ValidationException } from 'apps/gateway/src/common/domain/validation-error';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) { }
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  @UploadAvatarSwagger()
  @UseGuards(AuthGuard('jwt'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserId() userId: string,
  ) {
    try {
      const command = new UploadAvatarCommand(
        userId,
        file.buffer,
        file.mimetype,
      );
      const result: Notification<string> =
        await this.commandBus.execute(command);
      return { avatarUrl: result.getDate() };
    } catch (e) {
      if (e instanceof ValidationException)
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          errors: e.errors.map((e) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
    }
  }
}
