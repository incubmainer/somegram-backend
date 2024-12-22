import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import {
  PostOutputDto,
  postToOutputMapper,
} from '../../api/dto/output-dto/post.output-dto';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { UserPost, User } from '@prisma/gateway';

export class GetPostQuery {
  constructor(public postId: string) {}
}

@QueryHandler(GetPostQuery)
export class GetPostUseCase
  implements
    IQueryHandler<GetPostQuery, AppNotificationResultType<PostOutputDto>>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(GetPostUseCase.name);
  }
  async execute(
    command: GetPostQuery,
  ): Promise<AppNotificationResultType<PostOutputDto>> {
    const { postId } = command;

    try {
      const post: UserPost | null =
        await this.postsQueryRepository.getPostById(postId);
      if (!post) this.appNotification.notFound();

      const postOwner: User = await this.usersQueryRepository.findUserById(
        post.userId,
      );

      const ownerAvatarUrl: string = await this.photoServiceAdapter.getAvatar(
        post.userId,
      );

      // TODO: Type
      const postPhotos = await this.photoServiceAdapter.getPostPhotos(post.id);

      const result: PostOutputDto = postToOutputMapper(
        post,
        postOwner,
        ownerAvatarUrl,
        postPhotos,
      );
      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
