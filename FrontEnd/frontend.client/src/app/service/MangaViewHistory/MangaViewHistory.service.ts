import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class MangaViewHistoryService {
  //private apiUrl = 'https://localhost:44331/api/manga';

  private apiUrl = 'http://localhost:5012/api/manga';

  constructor(private http: HttpClient) {
  }

  getAllView(idManga: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/getAllView?idManga=${idManga}`);
  }

  getViewByDay(idManga: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/getViewByDay?idManga=${idManga}`);
  }

  getViewByWeek(idManga: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/getViewByWeek?idManga=${idManga}`);
  }

  getViewByMonth(idManga: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/getViewByMonth?idManga=${idManga}`);
  }

  createHistory(idManga: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/createHistory/${idManga}`, idManga);
  }
}
