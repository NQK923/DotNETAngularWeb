import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChapterDetailsService {
    private apiUrl = 'https://localhost:44345/api/manga';

    constructor(private http: HttpClient) { }

    getMangaById(id_manga: number, index: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id_manga}/chapter/${index}`);
    }
    getImagesByMangaIdAndIndex(id_manga: number, index: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id_manga}/chapters/${index}/images`);
    }

}
