import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { HDividerComponent } from '@elementar/components/divider';
import { LoginServiceService } from "../../service/auth/login-service.service";
import { FormsModule } from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    RouterLink,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatIconButton,
    MatSuffix,
    HDividerComponent,
    FormsModule
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']  // Notez le 'styleUrls' correct
})
export class SigninComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isConnected: boolean = false;

  constructor(
    private readonly loginService: LoginServiceService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isConnected = !!localStorage.getItem('currentUser');
    }
  }

  login() {
    this.loginService.login(this.username, this.password).subscribe(
      response => {
        console.log(response.bearer);

        if (isPlatformBrowser(this.platformId)) {
          // Vérifiez si le token est présent dans la réponse
          if (response.bearer) {
            localStorage.setItem("bearer", response.bearer); // Stockez le token
            localStorage.setItem("currentUser", JSON.stringify(response)); // Stockez les détails de l'utilisateur

            // Vérifiez si le tableau de rôles existe et a au moins un élément
            if (Array.isArray(response.role) && response.role.length > 0) {
              localStorage.setItem("role", response.role[0]); // Stockez le premier rôle
            } else {
              this.snackBar.open("Aucun rôle trouvé dans la réponse.", "Error", { duration: 4000 });
            }
            // Redirigez l'utilisateur après une connexion réussie
            this.router.navigate(['/']);
            this.snackBar.open("Connexion réussie avec succès", "Success", { duration: 4000 });
          } else {
            this.snackBar.open("Aucun token reçu dans la réponse.", "Error", { duration: 4000 });
          }
        }

        // Réinitialisez les champs de saisie
        this.username = '';
        this.password = '';
      },
      error => {
        console.error('Erreur de connexion :', error); // Ajoutez un log pour les erreurs
        this.snackBar.open("Nom d'utilisateur ou mot de passe incorrect", "Error", { duration: 4000 });
        this.username = '';
        this.password = '';
      }
    );
  }


/* handleSubmit() {
    if (!this.username || !this.password) {
      this.showError("Email and Password are required");
      return;
    }

    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log("Réponse de l'API:", response); // Vérifiez la structure de la réponse

        // Accédez au token
        const token = response.token; // Assurez-vous d'utiliser 'token'

        if (token) {
          localStorage.setItem('token', token);
          console.log("Token stocké:", token);
        } else {
          this.showError("Token non reçu dans la réponse.");
        }

        console.log("Role", response.role);
        this.router.navigateByUrl('/').then(() => {
          console.log("Redirection effectuée");
        });
      },
      error: (error) => {
        const errorMessage = error.error && error.error.message ? error.error.message : "An unexpected error occurred.";
        this.showError(errorMessage);
      }
    });
  }*/

// Fonction pour décoder un token JWT
  // Fonction pour décoder un token JWT
  /*private decodeToken(token: string) {
    const payload = token.split('.')[1]; // Prend la partie payload
    const decodedPayload = atob(payload); // Décodage base64
    return JSON.parse(decodedPayload); // Convertit en objet JSON
  }

  handleSubmit() {
    // Vérifier si l'username et le mot de passe sont fournis
    if (!this.username || !this.password) {
      this.showError("Email and Password are required");
      return;
    }

    // Appeler le service de connexion
    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log("Réponse de l'API:", response); // Vérifiez la structure de la réponse

        // Accédez au token
        const token = response.token; // Assurez-vous d'utiliser 'token'

          localStorage.setItem('token', token); // Stockez le token dans localStorage
          console.log("Token stocké:", token);

          // Décoder le token pour obtenir le rôle
          const decodedToken = this.decodeToken(token);
          const role = decodedToken.role; // Récupérez le rôle du payload
          console.log("Role récupéré:", role, typeof role); // Affichez le rôle et son type pour déboguer

          // Vérifiez si le rôle est bien une chaîne de caractères
          if (typeof role === 'string') {
            // Rediriger en fonction du rôle
            if (role.toLowerCase() === 'Personnel') { // Vérifiez la casse du rôle
              console.log("Redirection vers la page d'accueil pour le personnel");
              this.router.navigate(['/']); // Redirection vers la page d'accueil pour le personnel
            } else {
              console.log("Redirection vers une autre page");
              this.router.navigate(['/autre-page']); // Redirection vers une autre page pour d'autres rôles
            }
          } else {
            this.showError("Le rôle n'est pas une chaîne valide."); // Gérer le cas où le rôle n'est pas valide
          }
      },
      error: (error) => {
        const errorMessage = error.error && error.error.message ? error.error.message : "An unexpected error occurred.";
        this.showError(errorMessage); // Affichez le message d'erreur
      }
    });
  }

*/








  showError(mess: string) {
    this.errorMessage = mess;
    setTimeout(() => {
      this.errorMessage = ''
    }, 3000)
  }


}
