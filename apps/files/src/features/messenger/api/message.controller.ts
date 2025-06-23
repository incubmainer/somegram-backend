import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { GetMessageInputDto } from './dto/input/get-message.input.dto';
import { DeleteMessageInputDto } from './dto/input/delete-message.input.dto';
import { UploadMessageInputDto } from './dto/input/upload-message.input.dto';
import {
  DELETE_FILE_MESSAGES_BY_IDS,
  GET_FILE_MESSAGE_BY_ID,
  UPLOAD_FILE_MESSAGE,
} from '../../../../../gateway/src/common/constants/service.constants';
import { DeleteMessageCommand } from '../applications/use-cases/delete-message.use-case';
import { UploadMessageCommand } from '../applications/use-cases/upload-message.use-case';
import { GetMessageQuery } from '../applications/query-cases/get-message.query-case';
import { MessageOutputDto } from './dto/output/message.output.dto';

@Controller('message')
export class MessageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: GET_FILE_MESSAGE_BY_ID })
  async getMessage(
    payload: GetMessageInputDto,
  ): Promise<MessageOutputDto | null> {
    return this.queryBus.execute(new GetMessageQuery(payload));
  }

  @MessagePattern({ cmd: UPLOAD_FILE_MESSAGE })
  async uploadMessage(payload: UploadMessageInputDto) {
    return this.commandBus.execute(new UploadMessageCommand(payload));
  }

  @MessagePattern({ cmd: DELETE_FILE_MESSAGES_BY_IDS })
  async deleteMessage(payload: DeleteMessageInputDto) {
    return this.commandBus.execute(new DeleteMessageCommand(payload));
  }
}
