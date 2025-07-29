import { FileDto } from '../../../../../../../gateway/src/features/posts/api/dto/input-dto/add-post.dto';
import { MessageTypeEnum } from '../../../models/types';

export class UploadMessageInputDto {
  messageId: string;
  chatId: string;
  message: FileDto;
  ownerId: string;
  participantId: string;
  type: MessageTypeEnum;
}
