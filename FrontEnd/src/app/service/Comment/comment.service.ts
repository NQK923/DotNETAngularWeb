import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import * as signalR from '@microsoft/signalr';
import {ModelComment} from "../../Model/ModelComment";


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  //private apiUrl = 'https://localhost:44372/api/comment';
  private port = 5006;
  private apiUrl: string = 'http://localhost:' + this.port + '/api/comment';
  private hubUrl = 'https://localhost:' + this.port + '/commentHub';

  //realtime
  [x: string]: any;
  private hubConnection!: signalR.HubConnection;

  private commentsSource = new BehaviorSubject<any[]>([]);
  comments$ = this.commentsSource.asObservable();

  constructor(private http: HttpClient) {
  }

  private startSignalRConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect() // Tự động kết nối lại khi bị gián đoạn
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected successfully'))
      .catch(err => {
        console.error('SignalR connection error: ', err);
        setTimeout(() => this.startSignalRConnection(), 10000); // Thử lại sau 5 giây
      });
  }

  private addSignalRListeners() {
    // Lắng nghe sự kiện thêm bình luận
    this.hubConnection.on('ReceiveComment', (comment: ModelComment) => {
      console.log('Received comment: ', comment);

      const currentComments = this.commentsSource.value;
      this.commentsSource.next([comment, ...currentComments]); // Thêm comment mới vào đầu danh sách
    });

    // Lắng nghe sự kiện cập nhật bình luận
    this.hubConnection.on('ReceiveUpdatedComment', (updatedComment: ModelComment) => {
      console.log('Received updated comment: ', updatedComment);

      const currentComments = this.commentsSource.value.map((comment) =>
        comment.idComment === updatedComment.idComment ? updatedComment : comment
      );

      this.commentsSource.next(currentComments); // Cập nhật danh sách bình luận
    });

    // Lắng nghe sự kiện xóa bình luận
    this.hubConnection.on('ReceiveDeletedComment', (idComment: number) => {
      console.log('Received deleted comment ID: ', idComment);
      const updatedComments = this.commentsSource.value.filter(
        (comment) => comment.idComment !== idComment
      );
      this.commentsSource.next(updatedComments);
    });

  }

  //addComment(Comment: ModelComment): Observable<ModelComment> {

  //  console.log(Comment)
  //  return this.http.post<ModelComment>(this.apiUrl, Comment);
  //}
  addComment(comment: ModelComment) {
    return this.http
      .post<ModelComment>(this.apiUrl, comment)
      .toPromise()
      .then((newComment) => {
        // Cập nhật danh sách bình luận để hiển thị ngay trên UI
        //const currentComments = this.commentsSource.value;
        //this.commentsSource.next([newComment, ...currentComments]);
        console.log('Comment created successfully:', newComment);

      })
      .catch((error) => {
        console.error('Error creating comment:', error);
        throw error; // Ném lỗi để xử lý trong component nếu cần
      });
  }

  //getCommnet(): Observable<ModelComment[]> {
  //  return this.http.get<ModelComment[]>(this.apiUrl);
  //}
  getComments(idChapter: number) {
    this.http
      .get<Comment[]>(`${this.apiUrl}/${idChapter}`)
      .subscribe({
        next: (comments) => {
          console.log('Received comments from API: ', comments);
          // Đảo ngược thứ tự bình luận
          const reversedComments = comments.reverse();
          this.commentsSource.next(reversedComments);

          //Nếu cần sap xep theo trường cụ thể
          //const sortedComments = comments.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          //this.commentsSource.next(sortedComments);
        },
        error: (err) => {
          console.error('Error fetching comments: ', err);
        },
      });
  }

  //updateComment(Comment: ModelComment): Observable<ModelComment> {
  //  return this.http.put<ModelComment>(this.apiUrl, Comment);
  //}
  updateComment(idComment: number, updatedComment: Partial<ModelComment>) {

    //console.log(" test cmt " + updatedComment.idComment);

    return this.http.put<ModelComment>(`${this.apiUrl}/${idComment}`, updatedComment);
  }

  //deleteBanner(id: number): Observable<boolean> {
  //  return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  //}

  deleteComment(idComment: number) {
    return this.http.delete(`${this.apiUrl}/${idComment}`);
  }

  //la add cmt
  sendComment(comment: ModelComment) {
    return this.http
      .post<ModelComment>(this.apiUrl, comment)
      .toPromise()
      .then((response) => {
        console.log('Comment sent successfully', response);
        return response; // Trả về dữ liệu phản hồi nếu cần
      })
      .catch((error) => {
        console.error('Error sending comment', error);
        throw error; // Ném lỗi để xử lý ở component
      });
  }
}
