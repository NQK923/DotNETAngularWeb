import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommentService} from "../../../service/Comment/comment.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {CommentData} from "../../ViewClient/viewer/viewer.component";
import {ModelComment} from "../../../Model/ModelComment";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {ModelAccount} from "../../../Model/ModelAccount";
import {AccountService} from "../../../service/Account/account.service";
import {MatSnackBar} from '@angular/material/snack-bar';
import {forkJoin, map} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";

@Component({
  selector: 'app-manager-comment',
  templateUrl: './manager-comment.component.html',
  styleUrls: ['./manager-comment.component.css']
})
export class ManagerCommentComponent implements OnInit {
  comment: ModelComment[] = [];
  comments: ModelComment[] = [];
  listInfoAccount: ModelInfoAccount[] = [];
  accountComment: ModelAccount | null = null;
  listDataComment: CommentData[] = [];
  accounts: ModelAccount[] = [];

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
      this.infoAccountService.getInfoAccount().subscribe(
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
    const existingCommentIds = new Set(this.listDataComment.map(comment => comment.Comment?.id_comment));
    const reportedComments = this.comments.filter(comment =>
      comment.isReported && !existingCommentIds.has(comment.id_comment)
    );
    const accountRequests = reportedComments.map(comment =>
      this.infoAccountService.getInfoAccountById(Number(comment.id_user)).pipe(
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


  banComment(id: any, gmail: any) {
    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
        for (const account of this.accounts) {
          if (account.id_account === id) {
            this.accountComment = account;
            const newAccount: ModelAccount = {
              id_account: this.accountComment.id_account,
              username: this.accountComment.username,
              password: this.accountComment.password,
              status: this.accountComment.status,
              banComment: true
            };
            this.updateComment(newAccount, gmail)
            return;
          }
        }
        if (!this.accountComment) {
          console.error('Không tìm thấy đối tượng với id khớp trong mảng.');
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

// Cập nhật bình luận
  updateComment(account: ModelAccount, gmail: string) {
    const title: string = "Thông báo tài khoản:";
    const text: string = "Tài khoản bị cấm bình luận";

    this.accountService.updateAccount(account).subscribe(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Cập nhật thành công!'
        });

        this.accountService.postMail(gmail.toString(), title.toString(), text.toString()).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Gửi mail thành công.'
            });
          },
          error: (error) => {
            console.error(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Có lỗi xảy ra khi gửi mail.'
            });
          }
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Thất bại',
          detail: 'Cập nhật thất bại!'
        });
        console.error('Update error:', error);
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
}
