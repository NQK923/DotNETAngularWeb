import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelInfoAccount } from '../../Model/ModelInfoAccoutn';
@Injectable({
  providedIn: 'root'
})
export class InfoAccountService {

  private apiUrl = 'https://localhost:44379/api/infoaccount';
  constructor(private http: HttpClient) { } // Removed the array brackets
  getinfoaccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiUrl);
  }
}
