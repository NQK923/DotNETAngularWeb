import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MangaUploadService {
  private apiUrl = 'https://localhost:44355/api/upload';

  constructor(private http: HttpClient) {}

  uploadManga(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
