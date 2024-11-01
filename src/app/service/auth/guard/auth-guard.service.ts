import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import {LoginServiceService} from "../login-service.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{

  constructor(private loginService:LoginServiceService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.loginService.currentUserValue;
    if (currentUser) {
      return true;
    }
    this.router.navigate(['auth/sign-in']);
    return false;
  }
}
