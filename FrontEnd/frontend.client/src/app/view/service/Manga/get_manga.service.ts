import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private apiUrl = 'https://localhost:44355/api/mangas';
  constructor(private http: HttpClient) {}
  getMangas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  getMangasByUser(id: number): Observable<any> {
    return this.http.get<any>(`https://localhost:44355/api/user/${id}/mangas`);
  }
}
