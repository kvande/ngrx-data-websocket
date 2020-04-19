import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class RouteInterceptor implements HttpInterceptor {

  private apiBaseAddress = 'http://localhost:5000/';

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const url = `${this.apiBaseAddress}${req.url}`;
    return next.handle(req.clone({url}));
  }
}
