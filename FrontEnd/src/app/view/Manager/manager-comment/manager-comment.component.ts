import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommentService} from "../../../service/Comment/comment.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {AccountService} from "../../../service/Account/account.service";
import {MatSnackBar} from '@angular/material/snack-bar';
import {forkJoin, map} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";

export interface ModelComment {
  idComment?: number;
  idChapter: number;
  idAccount: number;
  content: string;
  isReported: boolean;
  time: Date;
}

export interface  ModelInfoAccount {
  id_infoAccount : number,
  id_account:number,
  name: string,
  email: string,
  cover_img: string,
}
export  interface ModelAccount{
  id_account?: number;
  username: string;
  password: string;
  banDate?: Date
  role?: boolean;
  status?: boolean;
  banComment?: boolean;

}
export class CommentData {
  Comment: ModelComment | null;
  InfoAccount: ModelInfoAccount | null;

  constructor(
    comment: ModelComment | null,
    infoAccount: ModelInfoAccount | null
  ) {
    this.Comment = comment;
    this.InfoAccount = infoAccount;
  }
}

@Component({
  selector: 'app-manager-comment',
  templateUrl: './manager-comment.component.html',
  styleUrls: ['./manager-comment.component.css']
})


export class ManagerCommentComponent implements OnInit {
  comment: ModelComment[] = [];
  comments: ModelComment[] = [];
  listDataComment: CommentData[] = [];
  listInfoAccount: ModelInfoAccount[] = [];


  constructor(private route: ActivatedRoute, private el: ElementRef, private router: Router,
              private commentService: CommentService,
              private infoAccountService: InfoAccountService,
              private accountService: AccountService,
              private snackBar: MatSnackBar,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,) {
  }

  ngOnInit() {
    this.applyTailwindClasses();
    this.loadComment()
      .then(() => this.loadInfoAccount())
      .then(() => this.takeData())
      .catch(error => console.error('Error loading data:', error));
  }

  loadInfoAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.infoAccountService.getAllInfoAccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.listInfoAccount = data;
          resolve();
        },
        (error) => {
          console.error('Error fetching info accounts', error);
        }
      );
    })
  }

  //Load chapter comment
  loadComment(): Promise<void> {
    return new Promise((resolve, reject) => {
        this.commentService.getCommnet().subscribe(
          (data: ModelComment[]) => {
            this.comments = data;
            resolve();
          },
          error => {
            console.error('Lỗi ', error);
          }
        );
      }
    )
  }

  //get comment data
  //get comment data
  takeData() {
    this.listDataComment = [];
    const existingCommentIds = new Set(this.listDataComment.map(comment => comment.Comment?.idComment));
    const reportedComments = this.comments.filter(comment =>
      comment.isReported && !existingCommentIds.has(comment.idComment)
    );
    const accountRequests = reportedComments.map(comment =>
      this.infoAccountService.getInfoAccountByIdTN(Number(comment.idAccount)).pipe(
        map((data: ModelInfoAccount) => new CommentData(comment, data))
      )
    );
    forkJoin(accountRequests).subscribe(
      (dataComments: CommentData[]) => {
        this.listDataComment.push(...dataComments);
      },
      (error) => {
        console.error('Error fetching account info:', error);
      }
    );
  }

// Xóa bình luận
  delete(id_cm: any) {
    this.confirmAction(
      'Bạn có chắc chắn muốn xóa bình luận này?',
      () => {
        this.commentService.deleteBanner(id_cm).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Xóa bình luận thành công!'
            });
            this.ngOnInit();
          },
          (error) => {
            console.error(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: 'Xóa bình luận thất bại!'
            });
          }
        );
      },
      () => {
      }
    );
  }

//cấm bl
  BanComment(id: any, gmail: any) {
    const title: string = "Thông báo tài khoản:";
    const text: string = "Tài khoản bị khóa bình luận";
    const banComments = true;
    console.log(id,banComments);
    this.accountService.updateBanComment(id,banComments).subscribe(
      response => {
          this.accountService.postMail(gmail,title, text)
            .subscribe(
              response => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Thành công',
                  detail: 'Đổi thành công'
                });
              },

              error => {
                console.error('Error sending email:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Lỗi',
                  detail: 'Lỗi gửi mail'
                });
              }
            );
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Cập nhật mật khẩu thành công'
        });
      },
      error => {
        console.error('Error updating password:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Cập nhật mật khẩu thất bại'
        });
      }
    );
  }
  goToIndex() {
    this.router.navigate(['/']);
  }

  goToManager() {
    this.router.navigate(['/manager']);
  }

  goToAccount() {
    this.router.navigate(['/manager-account']);
  }

  goToStatiscal() {
    this.router.navigate(['/manager-statiscal']);
  }

  goToComment() {
    this.router.navigate(['/manager-comment']);
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories2');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }

  confirmAction = (message: string, onConfirm: () => void, onCancel: () => void) => {
    this.confirmationService.confirm({
      message: message,
      header: 'Xác nhận',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: onConfirm,
      reject: onCancel
    });
  }
  logOut() {
    localStorage.setItem('userId', "-1");
    this.router.navigate([`/`]);
  }
}
