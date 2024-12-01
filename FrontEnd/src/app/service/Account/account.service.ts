import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModelAccount } from '../../Model/ModelAccount'
import { ModelInfoAccount } from "../../Model/ModelInfoAccoutn";
import { LoginRegisterRequest } from '../../Model/Account/LoginRegisterRequest';
import { FacebookLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { InfoAccountService } from '../InfoAccount/info-account.service';
import { AddInfoAccountRequest } from '../../Model/InfoAccount/AddInfoAccountRequest';
import { AccountCookieResponse } from '../../Model/Account/AccountCookieResponse';



@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private port = 7253;
  private apiLoginUrl: string = 'http://localhost:' + this.port + '/account/login';
  private apiGetAccountCookieUrl: string = 'http://localhost:' + this.port + '/account/getAccountCookie';
  private apiCheckOldPasswordUrl: string = 'http://localhost:' + this.port + '/account/checkOldPasswordAccountByID';
  private apiRegisterUrl: string = 'http://localhost:' + this.port + '/account/register';
  private apiCheckExistExternalAccountUrl: string = 'http://localhost:' + this.port + '/account/checkExistExternalAccount';
  private apiRegisterExternalAccount: string = 'http://localhost:' + this.port + '/account/registerExternalAccount';
  private apiIsLoggedIn: string = 'http://localhost:' + this.port + '/account/isLoggedIn';
  private apiLogOut: string = 'http://localhost:' + this.port + '/account/logOut';
  private apiCheckEmail: string = 'http://localhost:' + this.port + '/infoAccount/CheckEmailValid';


  user: SocialUser | undefined;

  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private authService: SocialAuthService, private http: HttpClient, private infoAccountService: InfoAccountService) {

  }

  logOut(callback: () => void): Promise<void> {
    return new Promise(() => {
      this.http.post<any>(this.apiLogOut, {}, { withCredentials: true }).subscribe({
        next: (response) => {
          this.authService.signOut();
          console.log(response)
          callback();
        },
        error: (error) => {
          console.log(error);
        }
      });
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  public checkExternalLogin(successCallback: () => void, failCallback: (error: string) => void): void {
    this.authService.authState.subscribe(async (user) => {
      console.log(user);
      this.LoginExternal(user, successCallback, failCallback);
    });
  }

  private async LoginExternal(user: SocialUser, successCallback: () => void, failCallback: (error: string) => void) {
    return new Promise((resolve, reject) => {
      this.http.post<string>(`${this.apiCheckExistExternalAccountUrl}?username=${user.id.toString()}`, {}, { withCredentials: true }).subscribe({
        next: async (response) => {
          console.log("LoginExternal")
          if (response == "Tài khoản chưa tồn tại") { await this.RegisterExternalAccount(user, successCallback); }
          else {
            console.log("else")
            this.loggedIn.next(true);
            successCallback();
          }
        },
        error: (error) => {
          failCallback(error.error);
          reject(false);
        }
      });
    });


  }

  private RegisterExternalAccount(user: SocialUser, successCallback: () => void): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http.post<number>(`${this.apiRegisterExternalAccount}?username=${user.id.toString()}`, {}).subscribe({
        next: (response) => {
          let newInfo: AddInfoAccountRequest;
          if (user.provider == "FACEBOOK") {
            newInfo = { name: user.name, img: user.response.picture.data.url, idAccount: response };
          }
          else { newInfo = { name: user.name, img: user.photoUrl, idAccount: response }; }
          this.infoAccountService.addInfoAccount(newInfo).subscribe(response => {
            this.loggedIn.next(true);
            successCallback();
            console.log(response);
          });
          resolve(response);
        },
        error: (error) => {
          console.log("Lỗi: " + error);
          reject(0);
        }
      });
    });
  }

  // Trả về cookie
  public getAccountCookie(): Promise<AccountCookieResponse> {
    // GỌI NHƯ NÀY ĐỂ SỬ DỤNG HÀM  await this.accountService.getIdAccount();
    return new Promise((resolve, reject) => {
      this.http.get<AccountCookieResponse>(this.apiGetAccountCookieUrl, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log("AccountCookieResponse" + response)
          // console.log("Mã tài khoản:"+response);
          resolve(response);
        },
        error: (error: HttpErrorResponse) => {
          reject(error);
        }
      });
    });
  }


  public getAccountCookieObservable(): Observable<AccountCookieResponse> {
    // GỌI NHƯ NÀY ĐỂ SỬ DỤNG HÀM  this.accountService.getIdAccountObservable().subscribe(response =>{  });
    return this.http.get<AccountCookieResponse>(this.apiGetAccountCookieUrl, { withCredentials: true })
  }

  public isLoggedIn(): Promise<Observable<boolean>> {
    return new Promise((resolve, reject) => {
      this.http.get<boolean>(this.apiIsLoggedIn, { withCredentials: true }).subscribe({
        next: (response) => {
          this.loggedIn.next(response);
          resolve(this.loggedIn.asObservable());
        },
        error: (error: HttpErrorResponse) => {
          console.log(error)
          reject(error);
        }
      });
    });
  }

  public isLoggedInObservable(): Observable<any> {
    return this.http.get<boolean>(this.apiIsLoggedIn, { withCredentials: true });
  }

  // Trả về cookie
  loginNormal(username: string, password: string, successCallback: () => void, failCallback: (error: string) => void): Promise<boolean> {

    let loginRequest: LoginRegisterRequest = { username: username, password: password };
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiLoginUrl, loginRequest, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log(response);
          this.loggedIn.next(true);
          successCallback();
          resolve(true);
        },
        error: (error: HttpErrorResponse) => {
          failCallback(error.error);
          reject(false);
        }
      });
    });
  }

  register(username: string, password: string, email: string): Promise<boolean> {
    let registerRequest: LoginRegisterRequest = { username: username, password: password };
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiRegisterUrl, registerRequest).subscribe({
        next: (response) => {
          let newInfo: AddInfoAccountRequest = { name: "user" + response, email: email, idAccount: response, img: "https://dotnetmangaimg.blob.core.windows.net/avatars/defaulImage.png" };
          this.infoAccountService.addInfoAccount(newInfo).subscribe(response => {
            console.log(response);
          });
          resolve(true);
        },
        error: (error) => {
          reject(false);
        }
      });
    });
  }

  public checkValidUsername(username: string): boolean {
    const usernamePattern = /^(?=.{6,12}$).+/;
    if (!usernamePattern.test(username)) {
      return false;
    }
    return true;
  }

  public checkValidCurrentPassword(oldPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.put<any>(this.apiCheckOldPasswordUrl, oldPassword).subscribe({
        next: () => {
          resolve(true);
        },
        error: (error) => {
          reject(false);
        }
      });
    });
  }

  public checkValidPassword(password: string): boolean {
    const passwordPattern = /^(?=.{6,30}$).+/;
    if (!passwordPattern.test(password)) {
      return false;
    }
    return true;
  }
  public checkConfirmPassword(password: string, confirmPassword: string): boolean {
    if (!(password == confirmPassword)) return false;
    return true;
  }

  public checkValidEmail(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post<boolean>(`${this.apiCheckEmail}?email=${email}`, {}).subscribe({
        next: (response) => {

          resolve(response);
        },
        error: (error: HttpErrorResponse) => {
          reject(error);
        }
      });
    });
  }
}
