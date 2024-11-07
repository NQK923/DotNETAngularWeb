import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  // private apiUrl = 'https://localhost:44370/api/categories';
  private apiUrl = 'http://localhost:5005/api/categories';

  constructor(private http: HttpClient) {
  }

  getAllCategories(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl);
  }
}
