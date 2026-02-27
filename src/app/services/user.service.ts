import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // ✅ USE RELATIVE PATH FOR PROXY
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

  // ✅ GET SINGLE USER
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetUser/${encodeURIComponent(userId)}`);
  }

  // ✅ DELETE USER (FIXED)
  deleteUser(userID: string) {
    return this.http.delete(
      `${this.baseUrl}/DeleteUser/${encodeURIComponent(userID)}`
    );
  }

  // ✅ UPDATE USER (FIXED)
  updateUser(userID: string, userData: any) {
    return this.http.put(
      `${this.baseUrl}/UpdateUser/${encodeURIComponent(userID)}`,
      userData
    );
  }

  // ✅ LOGIN
  login(credentials: any) {
    return this.http.post(`/api/Login`, {
      userID: credentials.userId,
      password: credentials.password,
      appKey: 'PROJECT_LENS_WEB'
    });
  }
}