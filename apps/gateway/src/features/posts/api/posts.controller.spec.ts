import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { CqrsModule } from '@nestjs/cqrs';

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [PostsController],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
