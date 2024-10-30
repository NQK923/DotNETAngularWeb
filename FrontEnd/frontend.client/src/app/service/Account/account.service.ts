import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ModelAccount } from '../../Model/ModelAccount'
import { ModelInfoAccount } from "../../Model/ModelInfoAccoutn";
import { LoginRegisterRequest } from '../../Model/Account/LoginRegisterRequest';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';



@Injectable({
  providedIn: 'root'
})
export class AccountService implements OnInit {
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


  user: SocialUser | undefined;
  loggedIn: boolean | undefined;

  constructor(private authService: SocialAuthService,private http: HttpClient) {
  }

  ngOnInit() {

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      console.log(user.response)
    });
  }
  postMail(email: string, title: string, text: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('title', title)
      .set('text', text);
    return this.http.post(this.apiPassword, null, { params });
  }

  updateaccount(account: ModelInfoAccount): Observable<ModelInfoAccount> {
    return this.http.put<ModelInfoAccount>(this.apiUpdateAccount, account);
  }


  uploadavata(formData: FormData): Observable<any> {
    return this.http.post(this.apiAvatar, formData);
  }

  getAccount(): Observable<ModelAccount[]> {
    return this.http.get<ModelAccount[]>(this.apiUrl);
  }

  addAccount(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.post<ModelAccount>(this.apiUrl, Account);
  }

  updateAccount(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.put<ModelAccount>(this.apiUrl, Account);
  }

  getinfoAccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiInfo);
  }

  public getIdAccount() : Promise<number>{
    return new Promise((resolve, reject) => {
      this.http.get<number>(this.apiGetIDAccountUrl, { withCredentials: true}).subscribe({
        next: (response) => {
          resolve(response);
        },
        error: (error: HttpErrorResponse) => {
          reject(error);
        }
      });
    });
  }

  loginNormal(username: string, password: string, failCallback: (error: string) => void): Promise<boolean> {
    let loginRequest: LoginRegisterRequest = { username: username, password: password };
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiLoginUrl, loginRequest, { withCredentials: true}).subscribe({
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
