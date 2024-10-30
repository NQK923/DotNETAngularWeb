import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ModelNotification} from '../../Model/ModelNotification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'https://localhost:44379/api/notification';
  private api = 'https://localhost:44379/api/notificationById';

  constructor(private http: HttpClient) {
  }

  getNotificationById(id_Notification: any): Observable<ModelNotification> {
    return this.http.get<ModelNotification>(`${this.api}/${id_Notification}`);
  }

  addNotification(notification: ModelNotification): Observable<ModelNotification> {
    return this.http.post<ModelNotification>(this.apiUrl, notification);
  }
}
