import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { AddPostCommentDto } from '../../api/dto/input-dto/add-post-comment.dto';
import { CreatedPostCommentDto } from '../../domain/types';
import { PostsCommentRepository } from '../../infrastructure/posts-comment.repository';

export class AddPostCommentCommand {
  constructor(
    public userId: string,
    public postId: string,
    public inputModel: AddPostCommentDto,
  ) {}
}

@CommandHandler(AddPostCommentCommand)
export class AddPostCommentUseCase
  implements
    ICommandHandler<AddPostCommentCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsRepository: PostsRepository,
    private readonly postsCommentRepository: PostsCommentRepository,
  ) {
    this.logger.setContext(AddPostCommentUseCase.name);
  }
  async execute(
    command: AddPostCommentCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: add post comment command', this.execute.name);
    const { userId, postId, inputModel } = command;
    const { body } = inputModel;
    try {
      const post = await this.postsRepository.getPostById(postId);

      if (!post) return this.appNotification.notFound();

      const createdCommentDto: CreatedPostCommentDto = {
        createdAt: new Date(),
        commentatorId: userId,
        postId: postId,
        text: body,
        answerForCommentId: null,
      };

      await this.postsCommentRepository.addComment(createdCommentDto);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
