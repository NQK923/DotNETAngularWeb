import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

interface Chapter {
  id_chapter: number;
  title: string;
  id_manga: number;
  view: number;
  created_at: Date;
  index: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  private apiUrl = 'https://localhost:44345/api/manga';

  constructor(private http: HttpClient) {
  }

  getImagesByMangaIdAndIndex(id_manga: number, index: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id_manga}/chapters/${index}/images`);
  }

  getChaptersByMangaId(id_manga: number): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.apiUrl}/${id_manga}/chapters`);
  }

  getLastedChapter(id_manga: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id_manga}/latestChapter`);
  }

  deleteSelectedChapter(id_manga: number, index: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id_manga}/chapter/${index}`);
  }

  deleteAllChapter(id_manga: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/chapters/${id_manga}`);
  }

  addChapter(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/chapter`, formData);
  }

  updateChapter(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/chapter/${id}`, formData);
  }

  uploadSingleImg(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/chapter/singleImg`, formData);
  }

  deleteSingleImg(uri: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/chapter/singleImg`, {
      params: {uri}
    });
  }
}
