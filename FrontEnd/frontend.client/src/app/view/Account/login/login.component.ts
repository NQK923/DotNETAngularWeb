import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ModelAccount} from "../../../Model/ModelAccount";
import {Router} from "@angular/router";
import {AccountService} from "../../../service/Account/account.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {Location} from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('register') registerBtn!: ElementRef;
  @ViewChild('login') loginBtn!: ElementRef;
  accounts: ModelAccount[] = [];

  constructor(private router: Router,
              private InfoAccountService: InfoAccountService,
              private accountService: AccountService, private location: Location) {
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

  goToForgotPassword() {
    this.router.navigate(['/update']);
  }

  goToUpdatePassword() {
    this.router.navigate(['/update']);
  }

  // check login
  loginWeb() {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const data: ModelAccount = {
      id_account: 0,
      username: username,
      password: password,
      banDate: new Date("2024-10-06T07:15:58.989Z"),
      role: true,
      status: true
    };
    this.accountService.login(data).subscribe({
      next: (response) => {
        this.TakeData(Number(response));
      },
      error: () => {
        alert('Vui lòng nhập đúng tài khoản mật khẩu');
      }
    });
  }

// get data login
  TakeData(response: number) {
    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
        this.checkAccount(response);
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

// check data login
  checkAccount(response: number) {
    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i].id_account === response) {
        if (!this.accounts[i].role && !this.accounts[i].status) {
          localStorage.setItem('userId', response.toString());
          this.router.navigate(['/']).then(r => {
            window.location.reload()
          });
        } else if (this.accounts[i].status) {
          alert('Tài khoản đã bị khóa, liên hệ quản lý để hổ trợ');
        } else if (this.accounts[i].role) {
          let id = this.accounts[i].id_account;
          // @ts-ignore
          localStorage.setItem('userId', id.toString());
          this.router.navigate(['/manager']);
        }
      }
    }
  }

  // create new account
  registerAccount(): void {
    const username = document.getElementById('usernameSign') as HTMLInputElement;
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('passwordSign') as HTMLInputElement;
    const passwordAccept = document.getElementById('passwordAccept') as HTMLInputElement;
    const data: ModelAccount = {
      username: username.value,
      password: password.value,
      banComment: false,
      role: false,
      status: false
    };

    if (!username.value) {
      alert("Tên người dùng không được để trống");
      return;
    }
    if (username.value.length > 12) {
      alert("Tên người dùng không quá 12 ký tự");
      return;
    }
    if (!email.value) {
      alert("Email không được để trống");
      return;
    }
    if (!password.value) {
      alert("Mật khẩu không được để trống");
      return;
    }
    if (password.value.length < 6) {
      alert("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (!passwordAccept.value) {
      alert("Xác nhận mật khẩu không được để trống");
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailPattern.test(email.value)) {
      alert("Email phải có định dạng: example@gmail.com");
      return;
    }
    if (password.value !== passwordAccept.value) {
      alert("Xác nhận mật khẩu khác với mật khẩu");
      return;
    }
    this.accountService.addAccount(data).subscribe({
      next: (response) => {
        if (typeof response === 'number') {
          alert('Login success');
          localStorage.setItem('userId', response);

          const infoAccount: ModelInfoAccount = {
            id_account: response,
            name: "Rỗng",
            email: email.value || "null@gmail.com"
          };
          this.InfoAccountService.addInfoAccount(infoAccount).subscribe({
            next: () => {
              this.router.navigate([`/index/User:${response}`]);
            },
            error: (error) => {
              alert('Lỗi thêm thông tin');
              console.error('Error adding account info:', error);
            }
          });
        } else {
          alert('Có vẽ tên đăng nhập đã được sử dụng');
        }
      },
      error: (err) => {
        alert('An error occurred during login. Please try again later.');
        console.error('Login error:', err);
      }
    });
  }
}
