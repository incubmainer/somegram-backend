import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { MongooseConfigService } from './database/mongoose/mongoose.config.service';
import { PhotosModule } from './features/files/photos.module';
import { filesConfig } from './common/config/config';
import { loadEnvFileNames } from './common/config/load-env-file-names';
import { SoundModule } from './features/sound/sound.module';

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
    SoundModule,
  ],
  controllers: [],
  providers: [],
})
export class FilesModule {}
