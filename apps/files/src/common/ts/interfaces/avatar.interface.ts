export interface IAvatar {
  _id?: string;
  ownerId: string;
  originalname: string;
  key: string;
  height: number;
  width: number;
  size: number;
  createdAt: Date;
}
