export interface ModelComment {
  id_comment?: number;
  id_chapter: number;
  id_user: number;
  content: string;
  isReported: boolean;
  time: Date;
}
