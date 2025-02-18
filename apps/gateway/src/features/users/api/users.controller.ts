import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UploadAvatarSwagger } from './swagger/upload-avatar.swagger';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { AuthGuard } from '@nestjs/passport';
import { FillProfileInputDto } from './dto/input-dto/fill-profile.input-dto';
import { FillingUserProfileCommand } from '../application/use-cases/filling-user-profile.use-case';
import { ProfileFillInfoSwagger } from './swagger/profile-fill-info.swagger';
import { ProfileInfoOutputDto } from './dto/output-dto/profile-info-output-dto';
import { ProfileInfoSwagger } from './swagger/profile-info.swagger';
import { DeleteAvatarSwagger } from './swagger/delete-avatar.swagger';
import { DeleteAvatarCommand } from '../application/use-cases/delete-avatar.use-case';

import { LoggerService } from '@app/logger';
import { USER_ROUTE } from '../../../common/constants/route.constants';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { UploadAvatarCommand } from '../application/use-cases/upload-avatar.use-case';
import { fileValidationPipe } from '../../../common/pipe/validation/validation-file.pipe';
import {
  ALLOWED_AVATAR_MIMETYPES,
  ALLOWED_AVATAR_SIZE,
} from '../../../common/constants/allowed-mimetype-size.constants';
import { GetProfileInfoQuery } from '../application/query-command/get-profile-info.use-case';

@ApiTags('Users')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth('access-token')
@Controller(USER_ROUTE.MAIN)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Get(USER_ROUTE.PROFILE_INFO)
  @ProfileInfoSwagger()
  @UseGuards(AuthGuard('jwt'))
  async gerProfileInfo(
    @CurrentUserId() userId: string,
  ): Promise<ProfileInfoOutputDto> {
    this.logger.debug(
      `Execute: Get profile info, user id: ${userId}`,
      this.gerProfileInfo.name,
    );

    const result: AppNotificationResultType<ProfileInfoOutputDto> =
      await this.queryBus.execute(new GetProfileInfoQuery(userId));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.gerProfileInfo.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.gerProfileInfo.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(USER_ROUTE.PROFILE_UPLOAD_AVATAR)
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @UploadAvatarSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  async uploadAvatar(
    @UploadedFile(
      fileValidationPipe(ALLOWED_AVATAR_MIMETYPES, ALLOWED_AVATAR_SIZE, 'file'),
    )
    file: Express.Multer.File,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    this.logger.debug(
      `Execute: Upload avatar, user id: ${userId}`,
      this.uploadAvatar.name,
    );
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(new UploadAvatarCommand(userId, file));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.uploadAvatar.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.uploadAvatar.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Put(USER_ROUTE.PROFILE_FILL_INFO)
  @UseGuards(AuthGuard('jwt'))
  @ProfileFillInfoSwagger()
  @HttpCode(HttpStatus.OK)
  async fillProfile(
    @CurrentUserId() userId: string,
    @Body() fillProfileDto: FillProfileInputDto,
  ): Promise<ProfileInfoOutputDto> {
    this.logger.debug(
      `Execute: Profile fill info, user id: ${userId}, body: ${JSON.stringify(fillProfileDto)}`,
      this.fillProfile.name,
    );

    const result: AppNotificationResultType<string> =
      await this.commandBus.execute(
        new FillingUserProfileCommand(userId, fillProfileDto),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.fillProfile.name);
        const userProfile: AppNotificationResultType<ProfileInfoOutputDto> =
          await this.queryBus.execute(new GetProfileInfoQuery(result.data));
        return userProfile.data;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.fillProfile.name);
        throw new NotFoundException();
      case AppNotificationResultEnum.BadRequest:
        this.logger.debug(`Bad request`, this.fillProfile.name);
        throw new BadRequestException(result.errorField);
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(USER_ROUTE.PROFILE_DELETE_AVATAR)
  @DeleteAvatarSwagger()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserAvatar(@CurrentUserId() userId: string): Promise<void> {
    this.logger.debug(
      `Execute: Delete avatar, user id: ${userId}`,
      this.deleteUserAvatar.name,
    );

    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(new DeleteAvatarCommand(userId));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.deleteUserAvatar.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug(`Not found`, this.deleteUserAvatar.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
