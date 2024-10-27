import {Component, ElementRef, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModelAccount} from "../../../Model/ModelAccount";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {AccountService} from "../../../service/Account/account.service";
import {ModelDataAccount} from "../../../Model/DataAccount";
import {MatSnackBar} from '@angular/material/snack-bar';
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ConfirmationService, MessageService} from "primeng/api";

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


  constructor(private InfoAccountService: InfoAccountService,
              private el: ElementRef,
              private router: Router,
              private accountService: AccountService,
              private snackBar: MatSnackBar,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,) {
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
        for (let i = 0; i < this.accounts.length; i++) {
          this.InfoAccountService.getInfoAccountById(Number(this.accounts[i].id_account)).subscribe(
            (data: ModelInfoAccount) => {
              {
                this.dataAccount.push(
                  {
                    Account: this.accounts[i],
                    InfoAccount: data
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

//Change Account status
  UpdateStatus(id: any, name: string, pass: string, status: any, gmail: any, ban: any) {
    const newStatus = !status;
    const account: ModelAccount = {
      id_account: id,
      username: name,
      password: pass,
      status: newStatus,
      banComment: ban
    };
    const title: string = "Thông báo tài khoản:";
    const text: string = "Tài khoản bị vô hiệu";
    this.confirmAction(
      `Bạn có chắc chắn muốn ${newStatus ? 'vô hiệu' : 'kích hoạt'} tài khoản "${name}"?`,
      () => {
        this.accountService.updateAccount(account).subscribe({
          next: () => {
            this.snackBar.open('Cập nhật thành công!', 'Đóng', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });

            if (newStatus) {
              this.accountService.postMail(gmail.toString(), title, text).subscribe({
                next: () => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Thông báo',
                    detail: 'Đã gửi thông báo vô hiệu tài khoản qua email'
                  });
                  this.ngOnInit();
                },
                error: (error) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Có lỗi xảy ra khi gửi email thông báo.'
                  });
                  console.error('Email error:', error);
                }
              });
            } else {
              this.ngOnInit();
            }
          },
          error: (error) => {
            this.snackBar.open('Cập nhật thất bại!', 'Đóng', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
            console.error('Update error:', error);
          }
        });
      },
      () => console.log('Thao tác cập nhật tài khoản đã bị hủy')
    );
  }


  UpdateComment(id: any, name: string, pass: string, status: any, gmail: any, ban: any) {
    const newCommentStatus = !ban;
    const account: ModelAccount = {
      id_account: id,
      username: name,
      password: pass,
      status: status,
      banComment: newCommentStatus
    };
    const title: string = "Thông báo tài khoản:";
    const text: string = "Tài khoản đã bị khóa quyền bình luận";
    this.confirmAction(
      `Bạn có chắc chắn muốn ${newCommentStatus ? 'khóa' : 'mở'} quyền bình luận cho tài khoản "${name}"?`,
      () => {
        this.accountService.updateAccount(account).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Cập nhật quyền bình luận thành công!'
            });
            if (newCommentStatus) {
              this.accountService.postMail(gmail.toString(), title, text).subscribe({
                next: () => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Thông báo',
                    detail: 'Đã gửi thông báo khóa quyền bình luận qua email'
                  });
                  this.ngOnInit();
                },
                error: (error) => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Có lỗi xảy ra khi gửi email thông báo.'
                  });
                  console.error('Email error:', error);
                }
              });
            } else {
              this.ngOnInit();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: 'Cập nhật quyền bình luận thất bại!'
            });
            console.error('Update error:', error);
          }
        });
      },
      () => console.log('Thao tác cập nhật quyền bình luận đã bị hủy')
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
}
