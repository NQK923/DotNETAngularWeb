import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AddInfoAccountRequest } from '../../Model/InfoAccount/AddInfoAccountRequest';
import { InfoAccountResponse } from '../../Model/InfoAccount/InfoAccountResponse';
import { InfoAccountRequest } from '../../Model/InfoAccount/InfoAccountRequest';



@Injectable({
  providedIn: 'root'
})
export class InfoAccountService {

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

  addInfoAccount(InfoAccount: AddInfoAccountRequest): Observable<string> {
    return this.http.post<string>(this.apiAddInfomationUrl, InfoAccount);
  }
}
