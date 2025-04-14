import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PostsCommentRepository } from '../../infrastructure/posts-comment.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { PostsLikeCommentRepository } from '../../infrastructure/posts-like-comment.repository';
import { CreatePostCommentLikeDto, LikeStatusEnum } from '../../domain/types';
import { AddLikeDislikeCommentDto } from '../../api/dto/input-dto/add-like-dislike-comment.dto';
import { LikeCommentEntity } from '../../domain/like.entity';

export class AddLikeDislikeCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public inputModel: AddLikeDislikeCommentDto,
  ) {}
}

@CommandHandler(AddLikeDislikeCommentCommand)
export class AddLikeDislikeCommentUseCase
  implements
    ICommandHandler<
      AddLikeDislikeCommentCommand,
      AppNotificationResultType<null>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsCommentRepository: PostsCommentRepository,
    private readonly postsLikeCommentRepository: PostsLikeCommentRepository,
  ) {
    this.logger.setContext(AddLikeDislikeCommentUseCase.name);
  }
  async execute(
    command: AddLikeDislikeCommentCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: add like/dislike for comment command',
      this.execute.name,
    );
    const { userId, commentId, inputModel } = command;
    const { status } = inputModel;
    try {
      const [comment, userLike] = await Promise.all([
        this.postsCommentRepository.getCommentById(commentId),
        this.postsLikeCommentRepository.getLikeByCommentIdAndUserId(
          commentId,
          userId,
        ),
      ]);

      if (!comment) return this.appNotification.notFound();

      if (!userLike) {
        await this.createNewLike(commentId, userId, status);
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
    commentId: string,
    userId: string,
    status: LikeStatusEnum,
  ): Promise<void> {
    const currentDate = new Date();

    const createdCommentDto: CreatePostCommentLikeDto = {
      createdAt: currentDate,
      updatedAt: currentDate,
      commentId: commentId,
      userId: userId,
      status: status,
    };

    await this.postsLikeCommentRepository.addLike(createdCommentDto);
  }

  private async updateCurrentLike(
    like: LikeCommentEntity,
    status: LikeStatusEnum,
  ): Promise<void> {
    if (like.status === status) return;

    like.updateLike(status);

    await this.postsLikeCommentRepository.updateLike(like);
  }
}
