import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModelAccount} from "../../../Model/ModelAccount";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {AccountService} from "../../../service/Account/account.service";
import {ModelDataAccount} from "../../../Model/DataAccount";
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-manager-account',
  templateUrl: './manager-account.component.html',
  styleUrls: ['./manager-account.component.css']
})
export class ManagerAccountComponent implements OnInit {
  accounts: ModelAccount[] = [];
  infoAccounts: ModelInfoAccount[] = [];
  dataAccount: ModelDataAccount[] = [];
  status: boolean | null = null;
  commentUpdate: boolean | null = null;


  constructor(private el: ElementRef, private router: Router, private accountService: AccountService, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.dataAccount = [];
    this.infoAccounts = [];
    this.setupEventListeners();
    this.applyTailwindClasses();
    this.TakeData();
  }

  //Get info account
  TakeData() {
    this.dataAccount = [];
    this.infoAccounts = []
    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
        this.accountService.getinfoAccount().subscribe(
          (data: ModelInfoAccount[]) => {
            this.infoAccounts = data;
            for (let i = 0; i < this.accounts.length; i++) {
              for (let j = 0; j < this.infoAccounts.length; j++) {
                if (this.accounts[i].id_account == this.infoAccounts[j].id_account) {
                  this.dataAccount.push(
                    {
                      Account: this.accounts[i],
                      InfoAccount: this.infoAccounts[j]
                    } as ModelDataAccount)
                  break
                }
              }
            }
          },
          (error) => {
            console.error('Error fetching account info:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

//Change Account status
  UpdateStatus(id: any, name: string, pass: string, status: any, gmail: any, ban: any) {
    this.status = !status;
    const account: ModelAccount = {
      id_account: id,
      username: name,
      password: pass,
      status: this.status,
      banComment: ban
    };
    const title: string = "Thông báo tài khoản:"
    const text: string = "Tài khoản bị vô hiệu "
    this.accountService.updateAccount(account).subscribe(
      (response) => {
        this.snackBar.open('Cập nhật thành công!', 'Đóng', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        if (this.status == true) {
          this.accountService.postMail(gmail.toString(), title.toString(), text.toString()).subscribe({
            next: (response) => {
              alert('Thành công gởi mail.');
              this.ngOnInit()
            },
            error: (error) => {
              alert('Có lỗi xảy ra khi gửi .');
            }
          })
        } else {
          this.ngOnInit()
        }
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

  //Update comment
  UpdateComment(id: any, name: string, pass: string, status: any, gmail: any, ban: any) {
    this.commentUpdate = !ban;
    const account: ModelAccount = {
      id_account: id,
      username: name,
      password: pass,
      status: status,
      banComment: this.commentUpdate
    };
    const title: string = "Thông báo tài khoản:"
    const text: string = "Tài khoản khóa bình luận "

    this.accountService.updateAccount(account).subscribe(
      (response) => {
        this.snackBar.open('Cập nhật thành công!', 'Đóng', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        if (this.commentUpdate == true) {
          this.accountService.postMail(gmail.toString(), title.toString(), text.toString()).subscribe({
            next: (response) => {
              alert('Thành công gởi mail.');
              this.ngOnInit()
            },
            error: (error) => {
              alert('Có lỗi xảy ra khi gửi .');
            }
          })
        } else {
          this.ngOnInit()
        }
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

  setupEventListeners() {
    const button = this.el.nativeElement.querySelector('#buttonAdd');
    const overlay = this.el.nativeElement.querySelector('#overlay');
    const out = this.el.nativeElement.querySelector('#out');
    if (out) {
      out.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }
    if (button) {
      button.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }
    const update = this.el.nativeElement.querySelector('#update');
    const viewUpdate = this.el.nativeElement.querySelector('#viewUpdate');
    const outs = this.el.nativeElement.querySelector('#outs');
    if (outs) {
      outs.addEventListener('click', () => {
        viewUpdate.classList.toggle('hidden');
      });
    }
    if (update) {
      update.addEventListener('click', () => {
        viewUpdate.classList.toggle('hidden');
      });
    }
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories1');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }
}
