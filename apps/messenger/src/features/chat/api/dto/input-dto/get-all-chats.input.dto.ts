import { SearchQueryParametersWithoutSorting } from '../../../../../../../gateway/src/common/domain/query.types';

export class GetAllChatsInputDto {
  userId: string;
  query: SearchQueryParametersWithoutSorting;
  endCursorChatId: string | null;
}
