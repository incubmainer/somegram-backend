import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { MongooseConfigService } from './database/mongoose/mongoose.config.service';
import { PhotosModule } from './features/files/photos.module';
import { filesConfig } from './common/config/config';
import { loadEnvFileNames } from './common/config/load-env-file-names';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: loadEnvFileNames(),
      load: [filesConfig],
    }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    PhotosModule,
  ],
  controllers: [],
  providers: [],
})
export class FilesModule {}
