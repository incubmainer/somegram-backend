import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { UserPostWithOwnerInfo } from '../../domain/types';

export class GetAdminPostByIdQuery {
  constructor(public postId: string) {}
}

@QueryHandler(GetAdminPostByIdQuery)
export class GetAdminPostsByIdUseCase
  implements
    IQueryHandler<
      GetAdminPostByIdQuery,
      AppNotificationResultType<UserPostWithOwnerInfo>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(GetAdminPostsByIdUseCase.name);
  }
  async execute(
    command: GetAdminPostByIdQuery,
  ): Promise<AppNotificationResultType<UserPostWithOwnerInfo>> {
    this.logger.debug(
      'Execute: get post by admin by post id command',
      this.execute.name,
    );
    const { postId } = command;

    try {
      const post =
        await this.postsQueryRepository.getPostByIdWithOwnerInfo(postId);

      if (!post) return this.appNotification.notFound();

      return this.appNotification.success(post);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
