import {  Component} from '@angular/core';
import { Router } from "@angular/router";
import { AccountService } from "../../../service/Account/account.service";

import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  // Two way data binding
  isActive: boolean = false;
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  messageErrorUsername: string = '';
  messageErrorPassword: string = '';

  isInvalidUsername: boolean = false;
  isInvalidPassword: boolean = false;
  isInvalidEmail: boolean = false;
  isInvalidConfirmPassword: boolean = false;


  // Two way data binding

  constructor(private router: Router,
    private accountService: AccountService, private messageService: MessageService,) {
    this.accountService.checkExternalLogin(this.gotToIndex.bind(this), this.failCallback.bind(this) );
  }


  goToForgotPassword(): void {
    this.router.navigate(['/update']);
  }

  goToUpdatePassword(): void {
    this.router.navigate(['/update']);
  }

  gotToIndex(): void {
    this.router.navigate(['/']);
  }

  signInFB(): void {
    this.accountService.signInWithFB();
  }

  reloadPage(): void {
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  // check login
  async loginNormal(): Promise<void> {
    if (!this.checkLoginData()) return;
    let result: boolean = await this.accountService.loginNormal(this.username, this.password, this.reloadPage.bind(this), this.failCallback.bind(this));
    if (!result) {
      return;
    }
  }

  private checkLoginData(): boolean {
    this.resetError();
    let flag: boolean;
    flag = this.checkValidUsername() || this.checkValidPassword();
    return flag;
  }

  failCallback(error: string): void {
    console.log("lỗi:" + error);
    switch (error) {
      case "Tài khoản không tồn tại":
        this.messageErrorUsername = error;
        this.isInvalidUsername = true;
        break;
      case "Sai mật khẩu":
        this.messageErrorPassword = error;
        this.isInvalidPassword = true;
        break;
      default:
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Tài khoản đã bị khóa tới thời gian : ' + error
        });
        break;
    }
  }

  resetError(): void {
    if (this.isInvalidConfirmPassword) this.isInvalidConfirmPassword = false;
    if (this.isInvalidEmail) this.isInvalidEmail = false;
    if (this.isInvalidUsername) this.isInvalidUsername = false;
    if (this.isInvalidPassword) this.isInvalidPassword = false;
  }

  changeForm(): void {
    this.resetError();
    if (this.isActive == false) {
      this.isActive = true;
      return;
    }
    this.isActive = false;
  }

  // create new account
  async registerAccount(): Promise<void> {
    if (!await this.checkRegisterData()) return;
    let result: boolean = await this.accountService.register(this.username, this.password, this.email)
    if (!result) { console.log("NOT OK"); return; }
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đăng ký thành công' });
    setTimeout(() => { window.location.reload() }, 1500); // 1000 milliseconds = 1 second }
  }

  private async checkRegisterData(): Promise<boolean> {
    this.resetError();
    let flag: boolean;
    flag = this.checkValidUsername() && await this.checkValidEmail() && this.checkValidPassword() && this.checkConfirmPassword();
    return flag;
  }

  private checkValidUsername(): boolean {
    if (!this.accountService.checkValidUsername(this.username)) {
      this.messageErrorUsername = "Tên người dùng không được để trống có ít nhất 6 ký tự không quá 12 ký tự";
      this.isInvalidUsername = true;
      return false;
    }
    this.isInvalidUsername = false;
    return true;
  }

  private async checkValidEmail(): Promise<boolean> {
    if (!await this.accountService.checkValidEmail(this.email)) { this.isInvalidEmail = true; return false; }
    this.isInvalidEmail = false;
    return true;
  }

  private checkConfirmPassword(): boolean {
    if (!this.accountService.checkConfirmPassword(this.password, this.confirmPassword)) { this.isInvalidConfirmPassword = true; return false; }
    this.isInvalidConfirmPassword = false;
    return true;
  }

  private checkValidPassword(): boolean {
    if (!this.accountService.checkValidPassword(this.password)) {
      this.messageErrorPassword = "Mật khẩu tối thiểu 6 ký tự và tối đa 30 ký tự";
      this.isInvalidPassword = true;
      return false;
    }
    this.isInvalidPassword = false;
    return true;
  }

  private checkValidCurrentPassword(): boolean {
    if (!this.accountService.checkValidCurrentPassword(this.password)) {
      this.messageErrorPassword = "Mật khẩu không đúng";
      this.isInvalidPassword = true;
      return false;
    }
    this.isInvalidPassword = false;
    return true;
  }

}
