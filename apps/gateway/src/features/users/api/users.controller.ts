import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Put,
  UnauthorizedException,
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
import { FillProfileInputDto } from './dto/input-dto/fill-profile.input-dto';
import {
  FillingUserProfileCodes,
  FillingUserProfileCommand,
} from '../application/use-cases/filling-user-profile.use-case';
import { ValidationError } from 'class-validator';
import { FillProfileSwagger } from './swagger/fill-profile.swagger';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

@ApiTags('Users')
@Controller('users')
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(UsersController.name);
  }
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

  @Put('fill-profile')
  @UseGuards(AuthGuard('jwt'))
  @FillProfileSwagger()
  async fillProfile(
    @CurrentUserId() userId: string,
    @Body() fillProfileDto: FillProfileInputDto,
  ) {
    const command = new FillingUserProfileCommand(
      userId,
      fillProfileDto.username,
      fillProfileDto.firstName,
      fillProfileDto.lastName,
      fillProfileDto.dateOfBirth,
      fillProfileDto.aboutMe,
      fillProfileDto.city,
    );
    const result: Notification<null, ValidationError> =
      await this.commandBus.execute(command);
    const code = result.getCode();
    if (code === FillingUserProfileCodes.Success)
      return { message: 'Profile filled successfully' };
    if (code === FillingUserProfileCodes.ValidationCommandError)
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: result.getErrors().map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    if (code === FillingUserProfileCodes.UserNotFound)
      throw new UnauthorizedException();
    if (code === FillingUserProfileCodes.TransactionError)
      throw new InternalServerErrorException();
  }
}
