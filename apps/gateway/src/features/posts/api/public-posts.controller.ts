import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ValidationError,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { GetPublicPostSwagger } from './swagger/get-public-post.swagger';
import { PostOutputDto } from './dto/output-dto/post.output-dto';
import {
  GetPostCodes,
  GetPublicPostCommand,
} from '../application/use-cases/get-public-post.use-case';
import { Notification } from 'apps/gateway/src/common/domain/notification';

@ApiTags('Public-Posts')
@Controller('public-posts')
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class PublicPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(PublicPostsController.name);
  }
  @Get(':postId')
  @GetPublicPostSwagger()
  @HttpCode(HttpStatus.OK)
  async getPost(@Param('postId') postId: string) {
    const getPostResult: Notification<PostOutputDto, ValidationError> =
      await this.commandBus.execute(new GetPublicPostCommand(postId));
    const resultCode = getPostResult.getCode();
    if (resultCode === GetPostCodes.Success) {
      return getPostResult.getData();
    }
    if (resultCode === GetPostCodes.PostNotFound) {
      throw new NotFoundException('Post not found');
    }
    if (resultCode === GetPostCodes.TransactionError) {
      throw new InternalServerErrorException();
    }
  }
}
