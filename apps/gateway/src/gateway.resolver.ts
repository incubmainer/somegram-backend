import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class GatewayResolver {
  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }
}
