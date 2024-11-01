import {HttpInterceptorFn} from "@angular/common/http";
import {inject} from "@angular/core";
import {LoginServiceService} from "./login-service.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(LoginServiceService);  // Injecter le AuthService
  const user = authService.getUserFormLocalStorage(); // Récupérer l'utilisateur depuis localStorage
  const token = user?.jwtToken; // Extraire le token de l'utilisateur s'il est disponible

  // Vérifiez si le token existe
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    // Passez la requête clonée au prochain gestionnaire
    return next(clonedReq);
  } else {
    // Passez la requête non modifiée si pas de token
    return next(req);
  }
};
