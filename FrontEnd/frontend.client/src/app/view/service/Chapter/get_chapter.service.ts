import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'https://localhost:44345/manga';

  constructor(private http: HttpClient) { }

  getChaptersByMangaId(id_manga: number): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.apiUrl}/${id_manga}/chapters`);
  }
  getTotalViewsByMangaId(id_manga: number): Observable<{ totalViews: number }> {
    return this.http.get<{ totalViews: number }>(`${this.apiUrl}/${id_manga}/totalviews`);
  }
  incrementChapterView(id_chapter: number): Observable<Chapter> {
    return this.http.put<Chapter>(`${this.apiUrl}/${id_chapter}/incrementView`, {});
  }
}