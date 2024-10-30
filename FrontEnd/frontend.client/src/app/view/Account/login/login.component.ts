import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ModelAccount} from "../../../Model/ModelAccount";
import {Router} from "@angular/router";
import {AccountService} from "../../../service/Account/account.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {MessageService} from "primeng/api";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('register') registerBtn!: ElementRef;
  @ViewChild('login') loginBtn!: ElementRef;
  accounts: ModelAccount | undefined;

  constructor(private router: Router,
              private InfoAccountService: InfoAccountService,
              private accountService: AccountService,
              private messageService: MessageService) {
  }

  ngAfterViewInit() {
    this.registerBtn.nativeElement.addEventListener('click', () => {
      this.container.nativeElement.classList.add('active');
    });
    this.loginBtn.nativeElement.addEventListener('click', () => {
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
    if (!username || !password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng nhập tên đăng nhập và mật khẩu'
      });
      return;
    }
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
        this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đúng tài khoản mật khẩu'});
      }
    });
  }

// get data login
  TakeData(response: number) {
    this.accountService.getAccountById(response).subscribe(
      (data) => {
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
    if (!this.accounts?.role && !this.accounts?.status) {
      localStorage.setItem('userId', response.toString());
      this.router.navigate(['/']).then(r => {
        window.location.reload()
      });
    } else if (this.accounts.status) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Tài khoản bị khóa',
        detail: 'Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản lý để được hỗ trợ.'
      });
    } else if (this.accounts.role) {
      // @ts-ignore
      localStorage.setItem('userId', this.accounts.id_account);
      this.router.navigate(['/manager']);
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
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Tên người dùng không được để trống'});
      return;
    }
    if (username.value.length > 12) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Tên người dùng không quá 12 ký tự'});
      return;
    }
    if (!email.value) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Email không được để trống'});
      return;
    }
    if (!password.value) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu không được để trống'});
      return;
    }
    if (password.value.length < 6) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu tối thiểu 6 ký tự'});
      return;
    }
    if (!passwordAccept.value) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xác nhận mật khẩu không được để trống'});
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailPattern.test(email.value)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Email phải có định dạng: example@gmail.com'
      });
      return;
    }
    if (password.value !== passwordAccept.value) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Xác nhận mật khẩu không trùng khớp'});
      return;
    }
    this.accountService.addAccount(data).subscribe({
      next: (response) => {
        if (typeof response === 'number') {
          this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Đăng ký thành công'});
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
              this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Lỗi thêm thông tin'});
              console.error('Error adding account info:', error);
            }
          });
        } else {
          this.messageService.add({severity: 'warn', summary: 'Cảnh báo', detail: 'Tên đăng nhập đã được sử dụng'});
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Có lỗi xảy ra trong quá trình đăng ký, vui lòng thử lại.'
        });
        console.error('Login error:', err);
      }
    });
  }
}
