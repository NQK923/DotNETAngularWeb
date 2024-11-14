import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelInfoAccount } from '../../Model/ModelInfoAccoutn';
import { AddInfoAccountRequest } from '../../Model/InfoAccount/AddInfoAccountRequest';

@Injectable({
  providedIn: 'root'
})
export class InfoAccountService {

  private apiUrl = 'https://localhost:44387/api/InfoAccount';
  private port = 7253;
  private apiAddInfomationUrl = `https://localhost:${this.port}/infoAccount/AddInfomation`;

  constructor(private http: HttpClient) {
  }

  getinfoaccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiUrl);
  }

  addInfoAccount(InfoAccount: AddInfoAccountRequest): Observable<string> {
    return this.http.post<string>(this.apiAddInfomationUrl, InfoAccount);
  }


}
