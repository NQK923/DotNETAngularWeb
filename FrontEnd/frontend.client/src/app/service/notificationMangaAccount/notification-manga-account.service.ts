import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ModelNotificationMangaAccount} from '../../Model/ModelNotificationMangaAccount';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationMangaAccountService {
  private apiUrl = 'https://localhost:44305/api/notificationMangAccount';

  constructor(private http: HttpClient) {
  }

  getNotificationMangaAccount(): Observable<ModelNotificationMangaAccount[]> {
    return this.http.get<ModelNotificationMangaAccount[]>(this.apiUrl);
  }

  addinfonotification(notification: ModelNotificationMangaAccount): Observable<ModelNotificationMangaAccount> {
    return this.http.post<ModelNotificationMangaAccount>(this.apiUrl, notification);
  }

  updateNotificationAccount(Comment: ModelNotificationMangaAccount): Observable<ModelNotificationMangaAccount> {
    return this.http.put<ModelNotificationMangaAccount>(this.apiUrl, Comment);
  }
}
