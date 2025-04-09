import { Resolver } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';

@Resolver()
export class CommentsResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly logger: LoggerService,
  ) {}
}
