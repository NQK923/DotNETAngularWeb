import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModelNotification } from '../../../Model/ModelNotification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'https://localhost:44379/api/notification';
  constructor(private http: HttpClient) { } // Removed the array brackets
  getNotification(): Observable<ModelNotification[]> {
    return this.http.get<ModelNotification[]>(this.apiUrl);
  }
}
