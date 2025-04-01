import { ApiProperty } from '@nestjs/swagger';
import { LikeStatusEnum, PostCommentRawModel } from '../../../domain/types';
import { Pagination } from '@app/paginator';
import { Injectable } from '@nestjs/common';

class CommentPostUserOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

class CommentPostLikeOutputDto {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikeCount: number;

  @ApiProperty({ enum: LikeStatusEnum })
  myStatus: LikeStatusEnum;
}

export class CommentPostOutputDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: CommentPostUserOutputDto })
  user: CommentPostUserOutputDto;

  @ApiProperty({ type: CommentPostLikeOutputDto })
  like: CommentPostLikeOutputDto;
}

export class CommentPostOutputDtoPaginationModel extends Pagination<CommentPostOutputDto> {
  @ApiProperty({
    type: CommentPostOutputDto,
    isArray: true,
  })
  items: CommentPostOutputDto;
}

@Injectable()
export class CommentPostOutputDtoMapper {
  mapComment(comment: PostCommentRawModel): CommentPostOutputDto {
    return {
      id: comment.id,
      body: comment.text,
      like: {
        likesCount: comment.likes || 0,
        dislikeCount: comment.dislikes || 0,
        myStatus: comment.myStatus || LikeStatusEnum.none,
      },
      createdAt: comment.createdAt,
      user: {
        id: comment.commentatorId,
        username: comment.username,
        avatarUrl: comment.avatar?.url || null,
      },
    };
  }

  mapComments(comments: PostCommentRawModel[]): CommentPostOutputDto[] {
    return comments.map((comment) => this.mapComment(comment));
  }
}
