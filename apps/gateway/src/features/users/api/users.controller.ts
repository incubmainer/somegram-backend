import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import {
  UploadAvatarCodes,
  UploadAvatarCommand,
} from '../application/use-cases/upload-avatar.use-case';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { FillProfileInputDto } from './dto/input-dto/fill-profile.input-dto';
import {
  FillingUserProfileCodes,
  FillingUserProfileCommand,
} from '../application/use-cases/filling-user-profile.use-case';
import { ValidationError } from 'class-validator';
import { ProfileFillInfoSwagger } from './swagger/profile-fill-info.swagger';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import {
  ProfileInfoOutputDto,
  userProfileInfoMapper,
} from './dto/output-dto/profile-info-output-dto';
import {
  GetProfileInfoCommand,
  ProfileInfoCodes,
} from '../application/use-cases/get-profile-info.use-case';
import { ProfileInfoSwagger } from './swagger/profile-info.swagger';
import { DeleteAvatarSwagger } from './swagger/delete-avatar.swagger';
import {
  DeleteAvatarCodes,
  DeleteAvatarCommand,
} from '../application/use-cases/delete-avatar.use-case copy';

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
  @Get('profile-info')
  @ProfileInfoSwagger()
  @UseGuards(AuthGuard('jwt'))
  async gerProfuleInfo(@CurrentUserId() userId: string) {
    this.logger.log('info', 'start profile info request', {});
    const notification: Notification<ProfileInfoOutputDto> =
      await this.commandBus.execute(new GetProfileInfoCommand(userId));
    const code = notification.getCode();
    if (code === ProfileInfoCodes.UserNotFound)
      throw new UnauthorizedException();
    if (code === ProfileInfoCodes.TransactionError) {
      throw new InternalServerErrorException();
    }
    const outputUser = notification.getData();
    return outputUser;
  }

  @Post('profile-upload-avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @UploadAvatarSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserId() userId: string,
  ) {
    this.logger.log('info', 'start upload avatar request', {});
    const result: Notification<null, ValidationError> =
      await this.commandBus.execute(new UploadAvatarCommand(userId, file));
    const code = result.getCode();
    if (code === UploadAvatarCodes.Success) {
      return;
    }
    if (code === UploadAvatarCodes.ValidationCommandError)
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: result.getErrors().map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    if (code === UploadAvatarCodes.UserNotFound)
      throw new UnauthorizedException();
    if (code === UploadAvatarCodes.TransactionError) {
      throw new InternalServerErrorException();
    }
  }

  @Put('profile-fill-info')
  @UseGuards(AuthGuard('jwt'))
  @ProfileFillInfoSwagger()
  @HttpCode(HttpStatus.OK)
  async fillProfile(
    @CurrentUserId() userId: string,
    @Body() fillProfileDto: FillProfileInputDto,
  ) {
    this.logger.log('info', 'start profile fill info request', {});
    const command = new FillingUserProfileCommand(
      userId,
      fillProfileDto.userName,
      fillProfileDto.firstName,
      fillProfileDto.lastName,
      fillProfileDto.dateOfBirth,
      fillProfileDto.about,
      fillProfileDto.city,
    );
    const result: Notification<null, ValidationError> =
      await this.commandBus.execute(command);
    const code = result.getCode();
    if (code === FillingUserProfileCodes.Success) {
      const data = result.getData();
      return userProfileInfoMapper(data);
    }
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
    if (code === FillingUserProfileCodes.UsernameAlreadyExists) {
      throw new BadRequestException({
        error: 'Username already exists',
      });
    }
    if (code === FillingUserProfileCodes.TransactionError)
      throw new InternalServerErrorException();
  }

  @Delete('profile-delete-avatar')
  @DeleteAvatarSwagger()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserAvatar(@CurrentUserId() userId: string) {
    this.logger.log('info', 'start delete avatar request', {});
    const notification: Notification<ProfileInfoOutputDto> =
      await this.commandBus.execute(new DeleteAvatarCommand(userId));
    const code = notification.getCode();
    if (code === DeleteAvatarCodes.Success) return;
    if (code === DeleteAvatarCodes.UserNotFound)
      throw new UnauthorizedException();
    if (code === DeleteAvatarCodes.TransactionError) {
      throw new InternalServerErrorException();
    }
  }
}
