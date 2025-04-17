import { INestMicroservice } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { MessengerModule } from '../messenger.module';
import { RpcCustomExceptionFilter } from '../common/exception-filters/rpc-exception/rpc-exception';

export const applySettings = (app: INestMicroservice): void => {
  useContainer(app.select(MessengerModule), { fallbackOnErrors: true });

  setExceptionFilter(app);
};

const setExceptionFilter = (app: INestMicroservice): void => {
  app.useGlobalFilters(new RpcCustomExceptionFilter());
};
