import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoggService {

  constructor(private http: HttpClient) { }

  getLogs(): Observable<any> {

    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>("https://localhost:7223/api/Log", { headers: headers })
  }
}
