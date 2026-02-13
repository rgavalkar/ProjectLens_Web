import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = '/api/User';

  constructor(private http: HttpClient) { }

  // ✅ GET ALL USERS
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetUsers`);
  }

  // ✅ CREATE USER
  createUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreateUser`, user);
  }

  // ✅ GET SINGLE USER (optional for future use)
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetUser/${userId}`);
  }

  // =============== DELETE USER =================
  deleteUser(userID: string) {
    return this.http.delete(
      `${this.baseUrl}/deleteUser/${userID}`
    );
  }

  // ================= LOGIN =================
  login(credentials: any) {
    return this.http.post(`${this.baseUrl.replace('/User', '')}/Login`, {
      userID: credentials.userId,
      password: credentials.password,
      appKey: 'PROJECT_LENS_WEB'
    });
  }
}
