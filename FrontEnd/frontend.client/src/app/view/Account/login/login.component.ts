import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ModelAccount} from "../../../Model/ModelAccount";
import {Router} from "@angular/router";
import {AccountService} from "../../../service/Account/account.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {MessageService} from "primeng/api";
import { Location } from '@angular/common';
import { LoginRegisterRequest } from '../../../Model/Account/LoginRegisterRequest';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  accounts: ModelAccount | undefined;

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
    private InfoAccountService: InfoAccountService,
    private accountService: AccountService, private location: Location, private authService: SocialAuthService,private messageService: MessageService) {
    this.accountService.checkExternalLogin(this.gotToIndex.bind(this));
  }


  goToForgotPassword(): void {
    this.router.navigate(['/update']);
  }

  goToUpdatePassword(): void {
    this.router.navigate(['/update']);
  }

  gotToIndex(): void {
    console.log("GoToIndex");
    this.router.navigate(['/']);
  }

  signInFB(): void {
    this.accountService.signInWithFB();
  }


  // check login
  async loginNormal(): Promise<void> {
    if (!this.checkLoginData()) return;
    let result: boolean = await this.accountService.loginNormal(this.username, this.password, this.gotToIndex.bind(this) ,this.failCallback.bind(this));
    if (!result) {
      // console.log("NOT OK");
      return;
    }
    // console.log(await this.accountService.getIdAccount());
    // console.log("OK");
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
    if (!this.checkRegisterData()) return;
    let result: boolean = await this.accountService.register(this.username, this.password)
    if (!result) { console.log("NOT OK"); return; }
    console.log("OK");
  }

  private checkRegisterData(): boolean {
    this.resetError();
    let flag: boolean;
    flag = this.checkValidUsername() || this.checkValidEmail() || this.checkValidPassword() || this.checkConfirmPassword();
    return flag;
  }

  private checkValidUsername(): boolean {
    if (!this.accountService.checkValidUsername(this.username)) {
      this.messageErrorUsername = "Tên người dùng không được để trống và không quá 12 ký tự";
      this.isInvalidUsername = true;
      return false;
    }
    this.isInvalidUsername = false;
    return true;
  }

  private checkValidEmail(): boolean {
    if (!this.accountService.checkValidEmail(this.username)) { this.isInvalidEmail = true; return false; }
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
      this.messageErrorPassword = "Mật khẩu không được để trống và tối thiểu 6 ký tự";
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
