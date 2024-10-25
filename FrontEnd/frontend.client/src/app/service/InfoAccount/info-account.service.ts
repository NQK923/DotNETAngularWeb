import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ModelInfoAccount} from '../../Model/ModelInfoAccoutn';

@Injectable({
  providedIn: 'root'
})
export class InfoAccountService {

  private apiUrl = 'https://localhost:44387/api/InfoAccount';


  constructor(private http: HttpClient) {
  }

  getinfoaccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiUrl);
  }

  addInfoAccount(InfoAccount: ModelInfoAccount): Observable<ModelInfoAccount> {
    return this.http.post<ModelInfoAccount>(this.apiUrl, InfoAccount);
  }
}
