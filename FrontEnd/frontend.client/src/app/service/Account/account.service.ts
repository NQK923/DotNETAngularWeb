import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModelAccount } from '../../Model/ModelAccount'
import { ModelInfoAccount } from "../../Model/ModelInfoAccoutn";
import { LoginRegisterRequest } from '../../Model/Account/LoginRegisterRequest';
import { FacebookLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';



@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'https://localhost:44385/api/Account';
  private apiUrlLogin = 'https://localhost:44385/api/Login';
  private apiInfo = 'https://localhost:44387/api/InfoAccount';
  private apiAvatar = 'https://localhost:44387/api/InfoAccountavata';
  private apiUpdateAccount = 'https://localhost:44387/api/InfoAccountupdate';
  private apiPassword = "https://localhost:44385/api/password";

  
  private apiUrl = 'http://localhost:5004/api/Account';
  private apiUrlLogin = 'http://localhost:5004/api/Login';
  private apiInfo = 'http://localhost:5011/api/InfoAccount';
  private apiAvatar = 'http://localhost:5011/api/InfoAccountavata';
  private updateAcc = 'http://localhost:5011/api/InfoAccountupdate';
  private apiPassword = "http://localhost:5004/api/password";
  private apiAcc = "http://localhost:5004/api/AccountById";

  private port = 7002;
  private apiUrl = `https://localhost:${this.port}/api/Account`;
  private apiLoginUrl: string = 'https://localhost:' + this.port + '/account/login';
  private apiGetIDAccountUrl: string = 'https://localhost:' + this.port + '/account/getIDAccount';
  private apiInfo = `https://localhost:${this.port}/api/InfoAccount`;
  private apiAvatar = `https://localhost:${this.port}/api/InfoAccountavata`;
  private apiUpdateAccount = `https://localhost:${this.port}/api/InfoAccountupdate`;
  private apiPassword = `https://localhost:${this.port}/api/password`;
  private apiCheckOldPasswordUrl: string = 'https://localhost:' + this.port + '/account/checkOldPasswordAccountByID';
  private apiRegisterUrl: string = 'https://localhost:' + this.port + '/account/register';
  private apiCheckExistExternalAccountUrl: string = 'https://localhost:' + this.port + '/account/checkExistExternalAccount';
  private apiRegisterExternalAccount: string = 'https://localhost:' + this.port + '/account/registerExternalAccount';
  private apiIsLoggedIn: string = 'https://localhost:' + this.port + '/account/isLoggedIn';
  user: SocialUser | undefined;

  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private authService: SocialAuthService, private http: HttpClient) {

  }

  postMail(email: string, title: string, text: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('title', title)
      .set('text', text);
    return this.http.post(this.apiPassword, null, { params });
  }

  updateaccount(account: ModelInfoAccount): Observable<ModelInfoAccount> {
    return this.http.put<ModelInfoAccount>(this.updateAcc, account);
  }

  getAccountById(id_account: number): Observable<ModelAccount> {
    return this.http.get<ModelAccount>(`${this.apiAcc}/${id_account}`);
  }

  uploadavata(formData: FormData): Observable<any> {
    return this.http.post(this.apiAvatar, formData);
  }

  getAccount(): Observable<ModelAccount[]> {
    return this.http.get<ModelAccount[]>(this.apiUrl);
  }

  updateAccount(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.put<ModelAccount>(this.apiUrl, Account);
  }

  getInfoAccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiInfo);
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  public checkExternalLogin(successCallback: () => void): void {
    this.authService.authState.subscribe((user) => {
      this.LoginExternal(user, successCallback);
    });
  }

  private async LoginExternal(user: SocialUser, successCallback: () => void) {
    let result: string = await this.CheckExistExternalAccount(user.id.toString());
    if (result == "Tài khoản chưa tồn tại") await this.RegisterExternalAccount(user.id.toString());
    successCallback();

  }

  private RegisterExternalAccount(username: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http.post<number>(`${this.apiRegisterExternalAccount}?username=${username}`, {}).subscribe({
        next: (response) => {
          // console.log("OK");
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
  private CheckExistExternalAccount(username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.post<string>(`${this.apiCheckExistExternalAccountUrl}?username=${username}`, {}, { withCredentials: true }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(false);
        }
      });
    });
  }


  public getIdAccount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http.get<number>(this.apiGetIDAccountUrl, { withCredentials: true }).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error: HttpErrorResponse) => {
          reject(error);
        }
      });
    });
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


  // Trả về cookie
  loginNormal(username: string, password: string, successCallback: () => void, failCallback: (error: string) => void): Promise<boolean> {
    let loginRequest: LoginRegisterRequest = { username: username, password: password };
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiLoginUrl, loginRequest, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log(response);
          resolve(true);
        },
        error: (error: HttpErrorResponse) => {
          failCallback(error.error);
          reject(false);
        }
      });
    });
  }

  register(username: string, password: string): Promise<boolean> {
    let registerRequest: LoginRegisterRequest = { username: username, password: password };
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiRegisterUrl, registerRequest).subscribe({
        next: () => {
          resolve(true);
        },
        error: (error) => {
          reject(false);
        }
      });
    });
  }

  public checkValidUsername(username: string): boolean {
    const usernamePattern = /^(?=.{1,12}$).+/;
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
    const passwordPattern = /^(?=.{6,}$).+/;
    if (!passwordPattern.test(password)) {
      return false;
    }
    return true;
  }
  public checkConfirmPassword(password: string, confirmPassword: string): boolean {
    if (!(password == confirmPassword)) return false;
    return true;
  }
  public checkValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailPattern.test(email)) {
      return false;
    }
    return true;
  }

}
