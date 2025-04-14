import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { CreatedPostCommentDto } from '../../domain/types';
import { PostsCommentRepository } from '../../infrastructure/posts-comment.repository';
import { AddAnswerForCommentDto } from '../../api/dto/input-dto/add-answer-for-comment.dto';

export class AddAnswerForCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
    public inputModel: AddAnswerForCommentDto,
  ) {}
}

@CommandHandler(AddAnswerForCommentCommand)
export class AddAnswerForCommentUseCase
  implements
    ICommandHandler<
      AddAnswerForCommentCommand,
      AppNotificationResultType<null>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsCommentRepository: PostsCommentRepository,
  ) {
    this.logger.setContext(AddAnswerForCommentUseCase.name);
  }
  async execute(
    command: AddAnswerForCommentCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: add post comment command', this.execute.name);
    const { userId, commentId, inputModel } = command;
    const { body } = inputModel;
    try {
      const comment =
        await this.postsCommentRepository.getCommentById(commentId);

      if (!comment) return this.appNotification.notFound();

      const createdCommentDto: CreatedPostCommentDto = {
        createdAt: new Date(),
        commentatorId: userId,
        postId: comment.postId,
        text: body,
        answerForCommentId: commentId,
      };

      await this.postsCommentRepository.addComment(createdCommentDto);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
