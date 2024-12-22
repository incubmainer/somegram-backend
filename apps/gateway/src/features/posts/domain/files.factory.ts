import { Injectable } from '@nestjs/common';

export class PostFileEntity {
  public originalname: string;
  public size: number;
  public mimetype: string;
  public buffer: Buffer;
}

@Injectable()
export class PostFileFactory extends PostFileEntity {
  static create(uploadFile: Express.Multer.File): PostFileFactory {
    const file = new this();
    file.originalname = uploadFile.originalname;
    file.size = uploadFile.size;
    file.mimetype = uploadFile.mimetype;
    file.buffer = uploadFile.buffer;
    return file;
  }

  static createMany(files: Express.Multer.File[]): PostFileFactory[] {
    const newFiles: PostFileFactory[] = [];
    files.forEach((file: Express.Multer.File): void => {
      const newFile: PostFileFactory = new this();
      newFile.originalname = file.originalname;
      newFile.size = file.size;
      newFile.mimetype = file.mimetype;
      newFile.buffer = file.buffer;
      newFiles.push(newFile);
    });
    return newFiles;
  }
}
