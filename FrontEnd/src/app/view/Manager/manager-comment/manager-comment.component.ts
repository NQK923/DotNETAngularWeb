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
              private snackBar: MatSnackBar) {
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
      this.infoAccountService.getinfoaccount().subscribe(
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
  takeData() {
    this.listDataComment = []
    for (var i = 0; i < this.comments.length; i++) {
      for (var k = 0; k < this.listDataComment.length; k++) {
        if (this.listDataComment[k].Comment?.id_comment == this.comments[i].id_comment) {
          return;
        }
      }
      for (var j = 0; j < this.listInfoAccount.length; j++) {
        if (this.comments[i].id_user === this.listInfoAccount[j].id_account && this.comments[i].isReported == true) {
          this.listDataComment.push(new CommentData(
            this.comments[i],
            this.listInfoAccount[j]
          ));

        }

      }
    }
  }

//delete comment
  delete(id_cm: any) {
    console.log(id_cm)
    this.commentService.deleteBanner(id_cm).subscribe(
      (response) => {
        alert('Upload thành công:');
        this.ngOnInit()
      },
      (error) => {
        console.error(error);
        alert('Upload thất bại:');
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
          console.log('Không tìm thấy đối tượng với id khớp trong mảng.');
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

//Update comment
  updateComment(account: ModelAccount, gmail: string) {
    const title: string = "Thông báo tài khoản:"
    const text: string = "Tài khoản bị cấm bình luận"
    this.accountService.updateAccount(account).subscribe(
      (response) => {
        this.snackBar.open('Cập nhật thành công!', 'Đóng', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.accountService.postMail(gmail.toString(), title.toString(), text.toString()).subscribe({
          next: (response) => {
            alert('Thành công gởi mail.');
          },
          error: (error) => {
            alert('Có lỗi xảy ra khi gửi .');
          }
        })
      },
      (error) => {
        this.snackBar.open('Cập nhật thất bại!', 'Đóng', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
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

  goToBanner() {
    this.router.navigate(['/manager-banner']);
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories2');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }
}
