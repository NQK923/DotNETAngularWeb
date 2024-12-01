import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelInfoAccount } from '../../Model/ModelInfoAccoutn';
import { AddInfoAccountRequest } from '../../Model/InfoAccount/AddInfoAccountRequest';
import { InfoAccountResponse } from '../../Model/InfoAccount/InfoAccountResponse';
import { InfoAccountRequest } from '../../Model/InfoAccount/InfoAccountRequest';

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
  private apiChangeInfoMationAccountByIDUrl = `http://localhost:${this.port}/infoAccount/ChangeInfoMationAccountByID`;


  constructor(private http: HttpClient) {
  }
  updateInfoAccountById(infoAccountReq: InfoAccountRequest, file: File | null): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('infoAccountReq', JSON.stringify(infoAccountReq));
    if (file !== null) {
      formData.append('file', file);
    }

    return this.http.put<any>(this.apiChangeInfoMationAccountByIDUrl, formData);
  }


  //Trung Nguyen làm
  getInfoAccountByIdTN(id_account: number): Observable<InfoAccountResponse> {
    return this.http.get<InfoAccountResponse>(`${this.apiGetInfomationAccountByIDUrl}?idAccount=${id_account}`);
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
