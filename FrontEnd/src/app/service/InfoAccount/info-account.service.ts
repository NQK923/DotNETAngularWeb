import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ModelInfoAccount} from '../../Model/ModelInfoAccoutn';
import { AddInfoAccountRequest } from '../../Model/InfoAccount/AddInfoAccountRequest';
import { InfoAccountResponse } from '../../Model/InfoAccount/InfoAccountResponse';

@Injectable({
  providedIn: 'root'
})
export class InfoAccountService {

  // private apiUrl = 'https://localhost:44387/api/InfoAccount';
  // private api = 'https://localhost:44387/api/InfoAccountById';

  private apiUrl = 'http://localhost:5011/api/InfoAccount';
  private api = 'http://localhost:5011/api/InfoAccountById';
  private port = 5004;
  private apiAddInfomationUrl = `http://localhost:${this.port}/infoAccount/AddInfomation`;
  private apiGetInfomationAccountByIDUrl = `http://localhost:${this.port}/infoAccount/GetInfoMationAccountByID`;


  constructor(private http: HttpClient) {
  }
  //Trung Nguyen làm
  getInfoAccountByIdTN(id_account: number): Observable<InfoAccountResponse> {
    return this.http.get<InfoAccountResponse>(`${this.apiGetInfomationAccountByIDUrl}/${id_account}`);
  }


  getInfoAccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiUrl);
  }

  // getInfoAccountById(id_account: number): Observable<ModelInfoAccount> {
  //   return this.http.get<ModelInfoAccount>(`${this.api}/${id_account}`);
  // }

  getinfoaccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiUrl);
  }

  addInfoAccount(InfoAccount: AddInfoAccountRequest): Observable<string> {
    return this.http.post<string>(this.apiAddInfomationUrl, InfoAccount);
  }
}
