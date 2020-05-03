import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from "@angular/common/http";
import { Observable } from "rxjs";
import { UserService } from "../Service/user.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let currentToken = UserService.token;
    if (currentToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `${currentToken}`
        }
      });
    }

    return next.handle(request);
  }
}
