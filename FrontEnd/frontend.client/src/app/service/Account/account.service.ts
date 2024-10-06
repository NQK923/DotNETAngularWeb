import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'https://localhost:7228/api/Account';

  constructor(private http: HttpClient) {}

  login(body: { username: string; password: string }): Observable<string> {
    return this.http.post<string>(this.apiUrl, body);
  }
}