import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModelNotificationMangaAccount } from 'src/app/Model/ModelNotificationMangaAccount';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotificationMangaAccountService {
  private apiUrl = 'https://localhost:44379/api/notificationMangAccount';
  constructor(private http: HttpClient) { } // Removed the array brackets
  getNotificationMangaAccount(): Observable<ModelNotificationMangaAccount[]> {
    return this.http.get<ModelNotificationMangaAccount[]>(this.apiUrl);
  }
}
