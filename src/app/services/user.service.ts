import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http : HttpClient) { }

  register(data: any) : Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>("https://localhost:7223/api/register", data, { headers: headers })
  }

  login(data: any) : Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>("https://localhost:7223/api/login", data, { headers: headers })

  }

  userList() : Observable<any[]> {

    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>("https://localhost:7223/api/User", { headers : headers } );
  }

  getMessage(id: any, count: number, before: any) : Observable<any> {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`https://localhost:7223/api/Message/${id}/?count=${count}&before=${before}`, { headers : headers } );
  }

  sendMesage(data: any, id: any) : Observable<any> {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      "receiverId" : id,
      "content" : data.message
    }

    return this.http.post<any>("https://localhost:7223/api/Message", body, { headers : headers })
  }

  deleteMessage(id: any) : Observable<any> {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`https://localhost:7223/api/Message/${id}`, { headers : headers });

  }

  editMessage(id: number, message: string) :  Observable<any> {

    const body = {
      "content" : message
    }

    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`https://localhost:7223/api/Message/${id}`, body, { headers : headers } );
  }

  VerifyToken(tokenId: string) :  Observable<any> {

    const body = {
      "TokenId" : tokenId
    }
    return this.http.post<any>("https://localhost:7223/api/SocialLogin", body)
  }

  searchHistory(result : any) :  Observable<any> {
    const token = localStorage.getItem('authToken');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`https://localhost:7223/api/conversation/search/${result}`, { headers : headers } )
  }

  getName(id : string) : Observable<any> {
    return this.http.get<any>(`https://localhost:7223/api/User/${id}`)
  }

}
