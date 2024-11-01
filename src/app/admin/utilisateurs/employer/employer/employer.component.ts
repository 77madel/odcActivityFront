import {Component} from '@angular/core';
import {Utilisateur} from '../../../../model/Utilisateur';
import {GlobalCrudService} from "../../../../service/global.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";
import {Role} from '../../../../model/Role';
import {RoleServiceService} from "../../../../service/role/role-service.service";
import {Entite} from '../../../../model/Entite';
import {EntiteOdcService} from "../../../../service/entite/entite-odc.service";

@Component({
  selector: 'app-employer',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './employer.component.html',
  styleUrl: './employer.component.scss'
})
export class EmployerComponent {

  utilisateurList!: Utilisateur[];
  selectedUtilisateur!: Utilisateur;
  utilisateurToAdd!: Utilisateur;
  role: Role[];
  entite: Entite[];


  isFormVisible: boolean = false;
  isTableVisible: boolean = true;
  isEditMode = false;

  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
    this.isTableVisible = !this.isTableVisible; // Basculer la visibilité de la table
  }


  searchTerm: string = '';
  genre: string[] = ['Homme', 'Femme'];



  itemsPerPage = 5; // Nombre d'éléments par page
  currentPage = 1; // Page actuelle

  get filteredUtilisateur() {
    if (!this.utilisateurList || this.utilisateurList.length === 0) {
      return []; // Retourner un tableau vide si utilisateurList n'est pas défini ou vide
    }
    if (!this.searchTerm) {
      return this.utilisateurList;
    }
    return this.utilisateurList.filter(element =>
      element.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.phone.includes(this.searchTerm) // Ajoutez d'autres propriétés si nécessaire
    );
  }

  get paginatedUtilisateur() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUtilisateur.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredUtilisateur.length / this.itemsPerPage) || 0; // Retourner 0 si la longueur est 0
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }



  constructor(
    private globalService: GlobalCrudService,
    private roleService: RoleServiceService,
    private entiteService: EntiteOdcService,
    private snackBar: MatSnackBar,) {
    this.utilisateurToAdd = new Utilisateur();
  }

  ngOnInit(): void {
    this.getAllUtilisateur();
    this.getRole();
    this.getEntite();
  }

  getAllUtilisateur(){
    this.globalService.get("utilisateur").subscribe({
      next: value => {
        this.utilisateurList = value
      },
      error: err => {
        console.log(err);
      }
    })
  }

  async getRole(): Promise<void> {
    try {
      const response = await this.roleService.getAllRole();
      this.role = response;
    } catch (error) {
      this.snackBar.open("Error", 'Une erreur est survenue lors de la récupération des rôles.',{duration: 3000});
    }
  }

  getEntite(){
    this.globalService.get("entite").subscribe({
      next: value => {
        this.entite = value
      },
      error: err => {
        console.log(err);
      }
    })
  }

  // Méthode pour afficher le formulaire pour ajouter un nouvel utilisateur ou modifier un utilisateur existant
  modifierUtilisateur(utilisateur: Utilisateur) {
    this.isEditMode = true; // Activer le mode édition
    this.utilisateurToAdd = { ...utilisateur }; // Remplir le formulaire avec les données de l'utilisateur sélectionné
    this.toggleForm(); // Afficher le formulaire
  }


  ajouterUtilisateur() {
    // Vérifiez que le rôle est sélectionné
    if (!this.utilisateurToAdd.role) {
      this.snackBar.open("Erreur", "Veuillez sélectionner un rôle.", { duration: 3000 });
      return;
    }

    if (this.isEditMode) {
      // Mode édition
      this.globalService.update("utilisateur", this.utilisateurToAdd.id!, this.utilisateurToAdd).subscribe({
        next: (data) => {
          console.log(data);
          this.getAllUtilisateur();
          this.snackBar.open("Succès", "Utilisateur modifié avec succès.", { duration: 3000 });
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open("Erreur", "Erreur lors de la modification de l'utilisateur : " + (err.error?.message || 'Erreur inconnue'), { duration: 3000 });
        }
      });
    } else {
      // Mode ajout
      this.globalService.post("utilisateur", this.utilisateurToAdd).subscribe({
        next: (data) => {
          console.log(data);
          this.getAllUtilisateur();
          this.snackBar.open("Succès", "Utilisateur ajouté avec succès.", { duration: 3000 });
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open("Erreur", "Erreur lors de l'ajout de l'utilisateur : " + (err.error?.message || 'Erreur inconnue'), { duration: 3000 });
        }
      });
    }
  }

  // Réinitialiser le formulaire après ajout ou modification
  resetForm() {
    this.isEditMode = false; // Désactiver le mode édition
    this.utilisateurToAdd = new Utilisateur(); // Réinitialiser à une nouvelle instance
    this.isFormVisible = false; // Cacher le formulaire
    this.isTableVisible = true; // Afficher la table
  }

  supprimerUtilisateur(selectedUtilisateur: Utilisateur ) {
    this.globalService.delete("utilisateur", selectedUtilisateur.id!).subscribe(
      {
        next: () => {
          this.snackBar.open("Succès","Suppresion effectue avec success.", {duration: 3000});
          this.getAllUtilisateur();
        },
        error: (err) => {
          console.log(err);
          this.snackBar.open("Erreur","Erreur lors de la suppression.", {duration: 3000});
        }
      }
    )
  }

  /*ajouterUtilisateur() {
    this.globalService.post("utilisateur", this.selectedUtilisateur).subscribe({
      next: (data) => {
        console.log(data);
        this.getAllUtilisateur();
        this.snackBar.open("Succès", "Utilisateur "+ this.utilisateurToAdd.nom + " ajouter avec succeess.", {duration: 3000})
      },
      error: (err) => {
        console.log(err);
        this.snackBar.open("Erreur","Erreur lors de l'ajout de l'superadmin")
      }
    })
  }*/

}
