import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = 'https://projectlensapi-a5bmb9gjchezf7bc.eastus2-01.azurewebsites.net/api/Upload/all';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
