import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from './services/user.service';  

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('token');

    let authReq = req;

    // ✅ Attach access token to every request
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        // 🔁 If token expired
        if (error.status === 401) {

          return this.userService.refreshToken().pipe(
            switchMap((res: any) => {

              // Save new access token
              localStorage.setItem('token', res.accessToken);

              // Retry original request
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.accessToken}`
                }
              });

              return next.handle(newReq);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}