import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = '/api/Upload/all';  
  private apiurl= '/api/Upload/savemailrequest';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  sendEmail(payload: any): Observable<any> {
  return this.http.post(this.apiurl, payload);
}
}

