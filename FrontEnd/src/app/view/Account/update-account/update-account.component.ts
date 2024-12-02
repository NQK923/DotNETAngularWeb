import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {AccountService} from "../../../service/Account/account.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {MessageService} from "primeng/api";
import {AccountModel} from '../../../Model/Account/AccountModel';
@Component({
  selector: 'app-update-account',
  templateUrl: './update-account.component.html',
  styleUrl: './update-account.component.css'
})

export class UpdateAccountComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('register') registerBtn!: ElementRef;
  @ViewChild('login') loginBtn!: ElementRef;
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
    const username = (document.getElementById('userName') as HTMLInputElement).value;
    const password = (document.getElementById('currentPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
    const otherPass = (document.getElementById('confirmPassword') as HTMLInputElement).value;
    this.code = localStorage.getItem('code');

    if (newPassword !== otherPass) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Mật khẩu xác nhận không khớp'});
      return;
    }
    if (!newPassword || !otherPass) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đủ thông tin'});
      return;
    }
    this.accountService.getAccountByUsername(username).subscribe(account => {

      if (account.password != password|| password != this.code) {
        this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đúng mật khẩu hoặc mã'});

      }else{

        this.accountService.updatePassword(Number(account.id_account),account.password,newPassword);
        this.messageService.add({
                          severity: 'success',
                          summary: 'Thành công',
                          detail: 'Cập nhật tài khoản thành công'
                        });
        return;

      }


    })
  }

  generateRandomNumbers() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  //Forgot password
  takePassWord() {
    const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
    const email = (document.getElementById('mailInput') as HTMLInputElement).value;

    this.accountService.getAccountByUsername(username).subscribe(account => {
      if (account && account.id_account !== undefined) {
        this.InfoAccountService.getInfoAccountByIdTN(account.id_account).subscribe(infoAccount => {
          if (email != infoAccount.email) {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Mail không tồn tại'
            });
          } else {
            const randomNumbers = this.generateRandomNumbers();
            localStorage.setItem('code', randomNumbers.toString());

            this.accountService.postMail(infoAccount.email, "Mã đổi mật khẩu", randomNumbers.toString());
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Vui lòng kiểm tra email để lấy mã đổi mật khẩu'
            });

          }

          console.log(infoAccount);
        }, error => {
          console.error('Error fetching account info:', error);
        });
      } else {
        console.error('Account not found or Id_account is undefined');
      }
    }, error => {
      console.error('Error fetching account:', error);
    });
  }
}
