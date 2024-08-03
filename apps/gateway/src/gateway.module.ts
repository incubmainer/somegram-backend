import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnvFileNames } from './common/config/load-env-file-names';
import { finalConfig } from './common/config/config';
import { AuthModule } from './features/auth/auth.module';
import { ClsTransactionalModule } from './common/modules/cls-transactional.module';
import { UsersModule } from './features/users/users.module';
import { PostsModule } from './features/posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: loadEnvFileNames(),
      load: [finalConfig],
    }),
    ClsTransactionalModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule {}
