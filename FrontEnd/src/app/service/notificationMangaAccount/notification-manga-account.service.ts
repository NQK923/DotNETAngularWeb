import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ModelNotificationMangaAccount} from '../../Model/ModelNotificationMangaAccount';
import {catchError, Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationMangaAccountService {
  // private apiUrl = 'https://localhost:44305/api/notificationMangAccount';
  // private api = 'https://localhost:44305/api/notificationMangAccountById';

  private apiUrl = 'http://localhost:5010/api/notificationMangAccount';
  private api = 'http://localhost:5010/api/notificationMangAccountById';

  constructor(private http: HttpClient) {
  }

  getByAccountId(idAccount: number): Observable<ModelNotificationMangaAccount[]> {
    return this.http.get<ModelNotificationMangaAccount[]>(`${this.api}/idAccount?idAccount=${idAccount}`).pipe(
      catchError((error: any) => {
        console.error('Error fetching notification manga account', error);
        return throwError(error);
      })
    );
  }

  addInfoNotification(notification: ModelNotificationMangaAccount): Observable<ModelNotificationMangaAccount> {
    return this.http.post<ModelNotificationMangaAccount>(this.apiUrl, notification);
  }

  updateNotificationAccount(data: ModelNotificationMangaAccount): Observable<ModelNotificationMangaAccount> {
    return this.http.put<ModelNotificationMangaAccount>(this.apiUrl, data);
  }

  toggleNotiStatus(idNoti: number | undefined): Observable<any> {
    return this.http.put(`${this.apiUrl}/status?idNotification=${idNoti}`, []);
  }
}
