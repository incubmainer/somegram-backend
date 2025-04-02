import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { AddLikeDislikePostDto } from '../../api/dto/input-dto/add-like-dislike-post.dto';
import { CreatePostLikeDto, LikeStatusEnum } from '../../domain/types';
import { LikePostEntity } from '../../domain/like.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsLikeRepository } from '../../infrastructure/posts-like.repository';

export class AddLikeDislikePostCommand {
  constructor(
    public userId: string,
    public postId: string,
    public inputModel: AddLikeDislikePostDto,
  ) {}
}

@CommandHandler(AddLikeDislikePostCommand)
export class AddLikeDislikePostUseCase
  implements
    ICommandHandler<AddLikeDislikePostCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsRepository: PostsRepository,
    private readonly postsLikeRepository: PostsLikeRepository,
  ) {
    this.logger.setContext(AddLikeDislikePostUseCase.name);
  }
  async execute(
    command: AddLikeDislikePostCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: add like/dislike for post command',
      this.execute.name,
    );
    const { userId, postId, inputModel } = command;
    const { status } = inputModel;
    try {
      const [post, userLike] = await Promise.all([
        this.postsRepository.getPostById(postId),
        this.postsLikeRepository.getLikeByPostIdAndUserId(postId, userId),
      ]);

      if (!post) return this.appNotification.notFound();

      if (!userLike) {
        await this.createNewLike(postId, userId, status);
      } else {
        await this.updateCurrentLike(userLike, status);
      }

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private async createNewLike(
    postId: string,
    userId: string,
    status: LikeStatusEnum,
  ): Promise<void> {
    const currentDate = new Date();

    const createdCommentDto: CreatePostLikeDto = {
      createdAt: currentDate,
      updatedAt: currentDate,
      postId: postId,
      userId: userId,
      status: status,
    };

    await this.postsLikeRepository.addLike(createdCommentDto);
  }

  private async updateCurrentLike(
    like: LikePostEntity,
    status: LikeStatusEnum,
  ): Promise<void> {
    if (like.status === status) return;

    like.updateLike(status);

    await this.postsLikeRepository.updateLike(like);
  }
}
