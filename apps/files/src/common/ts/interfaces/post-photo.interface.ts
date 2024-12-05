export interface IPostPhoto {
  _id?: string;
  ownerId: string;
  postId: string;
  originalname: string;
  key: string;
  height: number;
  width: number;
  size: number;
  createdAt: Date;
}
