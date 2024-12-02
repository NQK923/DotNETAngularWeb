import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AccountService} from "../../../service/Account/account.service";
import {MatSnackBar} from '@angular/material/snack-bar';
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {AccountModel} from '../../../Model/Account/AccountModel';
//import {ModelDataAccount} from  '../../../Model/Account/DataAccounts';
import {InfoAccountResponse} from '../../../Model/InfoAccount/InfoAccountResponse';

export interface ModelDataAccount {
  id_account?: number;
  username: string;
  password: string;
  banDate?: Date
  role?: boolean;
  status?: boolean;
  banComment?: boolean;
  name: string,
  email: string,
  cover_img: string,

}
@Component({
  selector: 'app-manager-account',
  templateUrl: './manager-account.component.html',
  styleUrls: ['./manager-account.component.css']
})


export class ManagerAccountComponent implements OnInit {
  status: boolean | null = null;
  accounts: AccountModel[] = [];
  infoAccounts: InfoAccountResponse[] = [];
  dataAccounts: ModelDataAccount[] = [];
  dataSearch: ModelDataAccount[] = [];
  tempData: ModelDataAccount[] = [];


  constructor(private InfoAccountService: InfoAccountService,
              private el: ElementRef,
              private router: Router,
              private accountService: AccountService,
              private snackBar: MatSnackBar,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,) {
  }

  ngOnInit() {
    this.setupEventListeners();
    this.applyTailwindClasses();
    this.TakeData();
  }
  isSimilar(str1: string, str2: string): boolean {
    const sequence = str1.toLowerCase();
    const target = str2.toLowerCase();
    let targetIndex = 0;

    for (const char of sequence) {
      if (targetIndex < target.length && char === target[targetIndex]) {
        targetIndex++;
      }
    }

    return targetIndex === target.length;
  }


  //Get info account
  TakeData() {
    this.dataAccounts = [];
    this.infoAccounts = [];
    this.accountService.getAllAccount().subscribe(
      (data: AccountModel[]) => {
        this.accounts = data;
        for (let i = 0; i < this.accounts.length; i++) {
          this.InfoAccountService.getInfoAccountByIdTN(Number(this.accounts[i].id_account)).subscribe(
            (data: InfoAccountResponse) => {
              {
                this.dataAccounts.push(
                  {
                    id_account:this.accounts[i].id_account,
                    username:this.accounts[i].username,
                    password: this.accounts[i].password,
                    banDate:this.accounts[i].banDate,
                    role: this.accounts[i].role,
                    status: this.accounts[i].status,
                    banComment: this.accounts[i].banComment,
                    name: data.name,
                    email: data.email,
                    cover_img: data.cover_img,
                  } as ModelDataAccount)

                this.tempData.push(
                  {
                    id_account:this.accounts[i].id_account,
                    username:this.accounts[i].username,
                    password: this.accounts[i].password,
                    banDate:this.accounts[i].banDate,
                    role: this.accounts[i].role,
                    status: this.accounts[i].status,
                    banComment: this.accounts[i].banComment,
                    name: data.name,
                    email: data.email,
                    cover_img: data.cover_img,
                  } as ModelDataAccount)


              }
            },
            (error) => {
              console.error('Error fetching account info:', error);
            }
          );
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }
  search() {
    this.dataSearch = [];
    const text = this.el.nativeElement.querySelector('#search').value;
    if (text === "") {
      this.dataAccounts = [];
      this.tempData = [];
      this.TakeData();
      this.messageService.add({
        severity: 'error',
        summary: 'Thất bại',
        detail: 'Không tìm thấy!'
      });
      return;
    }

    for (let i = 0; i < this.tempData.length; i++) {
      let temp = this.isSimilar(this.tempData[i].username, text);
      if (temp) {
        const exists = this.dataSearch.some(
          account => account.username === this.tempData[i].username
        );
        if (!exists) {
          this.dataSearch.push(this.tempData[i]);
        }
      }
    }
    if (this.dataSearch.length > 0) {
      this.dataAccounts = this.dataSearch;
    } else {
      this.dataAccounts= [];
      this.tempData = [];
      this.TakeData();
      this.messageService.add({
        severity: 'error',
        summary: 'Thất bại',
        detail: 'Không tìm thấy!'
      });
    }
  }

//Change Account status
  UpdateStatus(id: any, status: any, gmail: any) {
    const title: string = "Thông báo tài khoản:";
    const text: string = "Tài khoản bị vô hiệu";
    const updateStatus = !status;
    this.accountService.updateStatus(id,updateStatus).subscribe(
      response => {

        if(updateStatus==false){
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
        }
        this.TakeData()
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




  UpdatebanComment(id: any, banComment: any, gmail: any) {
      const title: string = "Thông báo tài khoản:";
      const text: string = "Tài khoản bị khóa bình luận";
      const banComments = !banComment;
      console.log(id,banComments);
      this.accountService.updateBanComment(id,banComments).subscribe(
        response => {

          if(banComments==true){
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
          }
          this.TakeData()
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

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories1');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }
  logOut() {
    localStorage.setItem('userId', "-1");
    this.router.navigate([`/`]);
  }
}
