import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { GetSoundInputDto } from './dto/input/get-sound.input.dto';
import { DeleteSoundInputDto } from './dto/input/delete-sound.input.dto';
import { UploadSoundInputDto } from './dto/input/upload-sound.input.dto';
import {
  DELETE_SOUND_BY_ID,
  GET_SOUND_BY_ID,
  UPLOAD_SOUND,
} from '../../../../../gateway/src/common/constants/service.constants';
import { DeleteSoundCommand } from '../applications/use-cases/delete-sound.use-case';
import { UploadSoundCommand } from '../applications/use-cases/upload-sound.use-case';
import { GetSoundQuery } from '../applications/query-cases/get-sound.query-case';
import { SoundOutputDto } from './dto/output/sound.output.dto';

@Controller('sounds')
export class SoundController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: GET_SOUND_BY_ID })
  async getSound(payload: GetSoundInputDto): Promise<SoundOutputDto | null> {
    return this.queryBus.execute(new GetSoundQuery(payload));
  }

  @MessagePattern({ cmd: UPLOAD_SOUND })
  async uploadSound(payload: UploadSoundInputDto) {
    return this.commandBus.execute(new UploadSoundCommand(payload));
  }

  @MessagePattern({ cmd: DELETE_SOUND_BY_ID })
  async deleteSound(payload: DeleteSoundInputDto) {
    return this.commandBus.execute(new DeleteSoundCommand(payload));
  }
}
