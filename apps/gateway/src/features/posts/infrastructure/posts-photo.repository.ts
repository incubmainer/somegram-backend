import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  PostPhoto,
} from '@prisma/gateway';
import {
  CustomLoggerService,
  InjectCustomLoggerService,
  LogClass,
} from '@app/custom-logger';

@Injectable()
@LogClass({
  level: 'trace',
  loggerClassField: 'logger',
  active: () => process.env.NODE_ENV !== 'production',
})
export class PostPhotoRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    @InjectCustomLoggerService() private readonly logger: CustomLoggerService,
  ) {
    logger.setContext(PostPhotoRepository.name);
  }
  public async addInfoAboutPhoto(dto: {
    postId: PostPhoto['postId'];
    photoKey: PostPhoto['photoKey'];
    createdAt: PostPhoto['createdAt'];
  }): Promise<void> {
    await this.txHost.tx.postPhoto.create({
      data: {
        postId: dto.postId,
        photoKey: dto.photoKey,
        createdAt: dto.createdAt,
      },
    });
  }

  // public async getAvatarKeyByUserId(
  //   userId: User['id'],
  // ): Promise<UserAvatar['avatarKey'] | null> {
  //   const result = await this.txHost.tx.userAvatar.findUnique({
  //     where: { userId },
  //     select: { avatarKey: true },
  //   });
  //   return result ? result.avatarKey : null;
  // }

  // public async deleteAvatarKeyByUserId(
  //   userId: User['id'],
  // ): Promise<UserAvatar> {
  //   return await this.txHost.tx.userAvatar.delete({
  //     where: { userId },
  //   });
  // }
}
