import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ModelNotification} from '../../Model/ModelNotification';
import {ModelManga} from "../../Model/ModelManga";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'https://localhost:44379/api/notification';
  private apimanga = 'https://localhost:44355/api/manga';

  constructor(private http: HttpClient) {
  }

  getNotification(): Observable<ModelNotification[]> {
    return this.http.get<ModelNotification[]>(this.apiUrl);
  }

  getManga(): Observable<ModelManga[]> {
    return this.http.get<ModelManga[]>(this.apimanga);
  }

  addnotification(notification: ModelNotification): Observable<ModelNotification> {
    return this.http.post<ModelNotification>(this.apiUrl, notification);
  }
}
