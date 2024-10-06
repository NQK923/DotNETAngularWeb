import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MangaDetailsService {
  private apiUrl = 'https://localhost:44355/api/mangas';

  constructor(private http: HttpClient) {}

  getMangaById(id_manga: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id_manga}`);
  }
}
