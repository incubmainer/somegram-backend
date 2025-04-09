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
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../../settings/configuration/configuration';

export class GetPostQuery {
  constructor(
    public postId: string,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetPostQuery)
export class GetPostUseCase
  implements
    IQueryHandler<GetPostQuery, AppNotificationResultType<PostOutputDto>>
{
  private readonly frontUrl: string;
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(GetPostUseCase.name);
    const frontProvider = this.configService.get('envSettings', {
      infer: true,
    }).FRONTED_PROVIDER;
    this.frontUrl = `${frontProvider}/public-user/profile`;
  }
  async execute(
    command: GetPostQuery,
  ): Promise<AppNotificationResultType<PostOutputDto>> {
    this.logger.debug('Execute: get post by id command', this.execute.name);
    const { postId, userId } = command;

    try {
      const post = await this.postsQueryRepository.getPostById(postId, userId);
      if (!post) return this.appNotification.notFound();

      const [postOwner, ownerAvatarUrl, postPhotos] = await Promise.all([
        this.usersQueryRepository.findUserById(post.userId),
        this.photoServiceAdapter.getAvatar(post.userId),
        this.photoServiceAdapter.getPostPhotos(post.id),
      ]);

      if (post.LikesPost.length > 0) {
        post.lastLikeUser = [];
        const promises = post.LikesPost.map(async (u) => {
          const avatar = await this.photoServiceAdapter.getAvatar(u.userId);

          post.lastLikeUser.push({
            userId: u.userId,
            avatarUrl: avatar?.url || null,
            profileUrl: `${this.frontUrl}/${u.userId}`,
          });
        });

        await Promise.all(promises);
      }

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
