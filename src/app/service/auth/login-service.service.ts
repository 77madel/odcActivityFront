import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { UtilFunction } from '../../Utils/utils-function';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  private BASE_URL = 'http://localhost:8080';
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = UtilFunction.isBrowser() ? localStorage.getItem('currentUser') : null;
    //const storedUser = this.isBrowser() ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/auth/login`, { username, password })
      .pipe(
        map(user => {
          if (user && user.token && this.isBrowser()) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('role', user.role); // Stocker le rôle de l'utilisateur
            this.currentUserSubject.next(user);
          }
          return user;
        }),
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token'); // Supprimer le token aussi
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['auth/sign-in']);
  }

  hasRole(role: string): boolean {
    return this.currentUserValue && this.currentUserValue.role && this.currentUserValue.role === role;
  }

  getUsername(): string | null {
    let user = this.currentUserSubject.value;
    return user ? user.email : null;
  }

  getUserFormLocalStorage(): any{
    let user!: Object;
    if (UtilFunction.isBrowser()) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error("Failed to parse user JSON:", e);
        }
      } else {
        console.log("No currentUser found in localStorage");
      }
    }
    return user;
  }


}
