import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CategoryDetailModel} from "../../Model/Category_details";

@Injectable({
  providedIn: 'root'
})
export class CategoryDetailsService {
  private apiUrl = 'https://localhost:44347/api';
  private Url = "https://localhost:44347/api/GetAll_category_details"

  constructor(private http: HttpClient) {
  }

  getCategoriesByIdManga(id_manga: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/category_details/${id_manga}`);
  }

  getIdMangaByCategories(list: number[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/category_details/getIdManga`, list);
  }

  addCategoriesDetails(list: number[]): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/add_manga_category`, list);
  }

  updateCategoriesDetails(list: number[]): Observable<any[]> {
    return this.http.put<any>(`${this.apiUrl}/update_manga_category`, list);
  }

  deleteCategoriesDetails(idCategories: number[]): Observable<any> {
    return this.http.request<any>('delete', `${this.apiUrl}/category_details/delete`, {body: idCategories});
  }

  getCategories(): Observable<CategoryDetailModel[]> {
    return this.http.get<CategoryDetailModel[]>(this.Url);
  }
}
