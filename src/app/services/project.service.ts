import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = '/api/Upload/all';
  private apiurl = '/api/Upload/savemailrequest';

  // private searchSource = new BehaviorSubject<string>('');
  // search$ = this.searchSource.asObservable();

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  sendEmail(payload: any): Observable<any> {
    return this.http.post(this.apiurl, payload);
  }

  // setSearch(value: string) {
  //   this.searchSource.next(value);
  // }
}