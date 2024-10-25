import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ModelAccount} from "../../../Model/ModelAccount";
import {Router} from "@angular/router";
import {AccountService} from "../../../service/Account/account.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";

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

  constructor(private el: ElementRef, private router: Router, private InfoAccountService: InfoAccountService, private accountService: AccountService) {
  }

  ngAfterViewInit() {
    this.registerBtn.nativeElement.addEventListener('click', () => {
      console.log('Register button clicked');
      this.container.nativeElement.classList.add('active');
    });
    this.loginBtn.nativeElement.addEventListener('click', () => {
      console.log('Login button clicked');
      this.container.nativeElement.classList.remove('active');
    });
  }

  TakeData() {
    this.accounts = []
    const username = (document.getElementById('userName') as HTMLInputElement).value;
    const password = (document.getElementById('currentPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
    const otherPass = (document.getElementById('confirmPassword') as HTMLInputElement).value;
    this.code = localStorage.getItem('code');
    if (newPassword != otherPass) {
      alert("Mật khẩu xác nhận không khớp")
      return
    }
    if (newPassword == "" && otherPass == "") {
      alert("Vui lòng nhập đủ ")
      return
    }
    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
        let accountFound = false;
        for (let i = 0; i < this.accounts.length; i++) {
          if (this.accounts[i].username === username) {
            accountFound = true;
            if (this.accounts[i].password == password || this.code == password) {
              const ac: ModelAccount = {
                id_account: this.accounts[i].id_account,
                username: this.accounts[i].username,
                password: newPassword,
                status: false,
                banComment: false,
              };
              this.accountService.updateAccount(ac).subscribe({
                next: (response) => {
                  alert('Cập nhật tài khoản thành công:');
                  this.router.navigate(['/newLogin']);
                },
                error: (err) => {
                  console.error('Có lỗi xảy ra khi cập nhật tài khoản:', err);
                }
              });
              break;
            } else {
              alert("Sai mã hoặc mâtj khẩu ")
            }
          }
        }
        if (!accountFound) {
          alert("Tài khoản không tồn tại.");
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
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
    let password: string | null = null;

    this.accountService.getAccount().subscribe(
      (accountsData: ModelAccount[]) => {
        this.accounts = accountsData;
        this.InfoAccountService.getinfoaccount().subscribe(
          (infoData: ModelInfoAccount[]) => {
            this.infoAccount = infoData;
            const emailExists = this.infoAccount.some(info => info.email === email);
            if (!emailExists) {
              alert('Email không đúng');
              return;
            }
            const account = this.accounts.find(acc => acc.username === username);
            if (account) {
              const randomNumbers = this.generateRandomNumbers();
              localStorage.setItem('code', randomNumbers.toString());
              const text: string = "Mã xác nhận";
              this.accountService.postMail(email, text.toString(), randomNumbers.toString()).subscribe({
                next: (response) => {
                  alert('Thành công! Vui lòng kiểm tra email để lấy mã đổi mật khẩu.');
                  this.container.nativeElement.classList.remove('active');
                },
                error: (error) => {
                  alert('Có lỗi xảy ra khi gửi mật khẩu.');
                }
              });
            } else {
              alert('Tên người dùng không tồn tại.');
            }
          },
          (error) => {
            console.error('Error fetching account info:', error);
            alert('Có lỗi xảy ra khi lấy thông tin tài khoản.');
          }
        );
      },
      (error) => {
        console.error('Error fetching accounts:', error);
        alert('Có lỗi xảy ra khi lấy danh sách tài khoản.');
      }
    );
  }


}
