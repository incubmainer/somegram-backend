import { FileDto } from '../../../../../../../gateway/src/features/posts/api/dto/input-dto/add-post.dto';

export class UploadSoundInputDto {
  messageId: string;
  chatId: string;
  message: FileDto;
  ownerId: string;
  participantId: string;
}
