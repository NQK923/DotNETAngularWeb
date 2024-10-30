import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private apiUrl = 'https://localhost:44355/api/manga'

  constructor(private http: HttpClient) {
  }

  getMangas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getUnPostedManga(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unPosted`);
  }

  getPostedManga(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posted`);
  }

  getMangasByUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${id}`);
  }

  getMangaById(id_manga: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${id_manga}`);
  }

  deleteMangaById(id_manga: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id_manga}`);
  }

  uploadManga(formData: FormData, id_account: number): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/upload/${id_account}`, formData, {
      headers: new HttpHeaders({'Accept': 'application/json'})
    });
  }

  updateManga(formData: FormData, id_manga: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id_manga}`, formData, {
      responseType: "arraybuffer",
      headers: new HttpHeaders({'Accept': 'application/json'})
    })
  }

  updateTimeManga(idManga: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateTime?idManga=${idManga}`, {})
  }

  ratingChange(idManga: number, ratedScore: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/ratingChange?idManga=${idManga}&ratedScore=${ratedScore}`, {});
  }

  changeStatus(idManga: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/changeStatus?idManga=${idManga}`, {})
  }
}
