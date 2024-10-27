import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ModelAccount} from "../../../Model/ModelAccount";
import {Router} from "@angular/router";
import {AccountService} from "../../../service/Account/account.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-update-account',
  templateUrl: './update-account.component.html',
  styleUrl: './update-account.component.css'
})

export class UpdateAccountComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('register') registerBtn!: ElementRef;
  @ViewChild('login') loginBtn!: ElementRef;
  accounts: ModelAccount[] = [];
  infoAccount: ModelInfoAccount[] = [];
  code: string | null = null;

  constructor(private router: Router,
              private InfoAccountService: InfoAccountService,
              private accountService: AccountService,
              private messageService: MessageService,) {
  }
  ngAfterViewInit() {
    this.registerBtn.nativeElement.addEventListener('click', () => {
      this.container.nativeElement.classList.add('active');
    });
    this.loginBtn.nativeElement.addEventListener('click', () => {
      this.container.nativeElement.classList.remove('active');
    });
  }

  TakeData() {
    this.accounts = [];
    const username = (document.getElementById('userName') as HTMLInputElement).value;
    const password = (document.getElementById('currentPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
    const otherPass = (document.getElementById('confirmPassword') as HTMLInputElement).value;
    this.code = localStorage.getItem('code');

    if (newPassword !== otherPass) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    if (!newPassword || !otherPass) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đủ thông tin' });
      return;
    }

    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
        let accountFound = false;
        for (let account of this.accounts) {
          if (account.username === username) {
            accountFound = true;
            if (account.password === password || this.code === password) {
              const updatedAccount: ModelAccount = {
                id_account: account.id_account,
                username: account.username,
                password: newPassword,
                status: false,
                banComment: false,
              };
              this.accountService.updateAccount(updatedAccount).subscribe({
                next: () => {
                  this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật tài khoản thành công' });
                  this.router.navigate(['/newLogin']);
                },
                error: (err) => {
                  console.error('Error updating account:', err);
                  this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi cập nhật tài khoản' });
                }
              });
              break;
            } else {
              this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Sai mã hoặc mật khẩu' });
            }
          }
        }
        if (!accountFound) {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tài khoản không tồn tại' });
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi lấy danh sách tài khoản' });
      }
    );
  }

  generateRandomNumbers() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  //Forgot password
  takePassWord() {
    const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
    const email = (document.getElementById('mailInput') as HTMLInputElement).value;
    this.accountService.getAccount().subscribe(
      (accountsData: ModelAccount[]) => {
        this.accounts = accountsData;
        this.InfoAccountService.getInfoAccount().subscribe(
          (infoData: ModelInfoAccount[]) => {
            this.infoAccount = infoData;
            const emailExists = this.infoAccount.some(info => info.email === email);
            if (!emailExists) {
              this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Email không đúng' });
              return;
            }
            const account = this.accounts.find(acc => acc.username === username);
            if (account) {
              const randomNumbers = this.generateRandomNumbers();
              localStorage.setItem('code', randomNumbers.toString());
              const text = "Mã xác nhận";
              this.accountService.postMail(email, text, randomNumbers.toString()).subscribe({
                next: () => {
                  this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Vui lòng kiểm tra email để lấy mã đổi mật khẩu' });
                  this.container.nativeElement.classList.remove('active');
                },
                error: (error) => {
                  console.error('Error sending email:', error);
                  this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi gửi mã xác nhận' });
                }
              });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên người dùng không tồn tại' });
            }
          },
          (error) => {
            console.error('Error fetching account info:', error);
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi lấy thông tin tài khoản' });
          }
        );
      },
      (error) => {
        console.error('Error fetching accounts:', error);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi lấy danh sách tài khoản' });
      }
    );
  }
}
