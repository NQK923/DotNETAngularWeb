import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelBanner } from '../../Model/ModelBanner';
@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = 'https://localhost:44351/api/banner';
  constructor(private http: HttpClient) { } // Removed the array brackets
  getBanner(): Observable<ModelBanner[]> {
    return this.http.get<ModelBanner[]>(this.apiUrl);
  }
  addBanner(banner: ModelBanner): Observable<ModelBanner> {
    return this.http.post<ModelBanner>(this.apiUrl, banner);
  }
  deleteBanner(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
