import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  PrismaClient as GatewayPrismaClient,
  User,
  UserPost,
} from '@prisma/gateway';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PostFileFactory } from '../../domain/files.factory';
import { Inject } from '@nestjs/common';

const TRANSACTION_TIMEOUT = 50000; //necessary to wait upload all files wihtout timeout error

export class AddPostCommand {
  constructor(
    public userId: string,
    public files: Express.Multer.File[],
    public description?: string,
  ) {}
}

@CommandHandler(AddPostCommand)
export class AddPostUseCase
  implements ICommandHandler<AddPostCommand, AppNotificationResultType<string>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsRepository: PostsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    @Inject(PostFileFactory.name)
    private readonly postFileFactory: typeof PostFileFactory,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(AddPostUseCase.name);
  }
  async execute(
    command: AddPostCommand,
  ): Promise<AppNotificationResultType<string>> {
    const { userId, files, description } = command;
    try {
      const user: User | null =
        await this.usersQueryRepository.findUserById(userId);
      if (!user) return this.appNotification.notFound();

      const uploadFiles: PostFileFactory[] =
        this.postFileFactory.createMany(files);

      const result: string = await this.txHost.withTransaction(
        { timeout: TRANSACTION_TIMEOUT },
        async (): Promise<string> => {
          const createdAt: Date = new Date();
          const post: UserPost = await this.postsRepository.addPost({
            userId,
            createdAt,
            description: description ? description : null,
          });

          for (const file of uploadFiles) {
            await this.photoServiceAdapter.uploadPostPhoto({
              ownerId: userId,
              postId: post.id,
              file,
            });
          }
          return post.id;
        },
      );
      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
