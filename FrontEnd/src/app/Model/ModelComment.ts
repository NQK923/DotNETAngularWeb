export interface ModelComment {
  idComment?: number;
  idChapter: number;
  idAccount: number;
  content: string;
  isReported: boolean;
  time: Date;
}
