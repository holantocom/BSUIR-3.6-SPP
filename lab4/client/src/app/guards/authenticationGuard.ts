import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";

import { UserService } from "../Service/user.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentToken = UserService.token;
    if (currentToken) {
      return true;
    }

    this.router.navigate(["/signin"], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
