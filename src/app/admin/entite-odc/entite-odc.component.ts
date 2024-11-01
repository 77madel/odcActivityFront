import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmrPhoneInputModule} from "@elementar/components/phone-input";
import {MatInput} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import { Entite } from '../../model/Entite';
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EntiteOdcService} from "../../service/entite/entite-odc.service";
import {Utilisateur} from "../../model/Utilisateur";
import {Role} from "../../model/Role";
import {GlobalCrudService} from "../../service/global.service";
import {RoleServiceService} from "../../service/role/role-service.service";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-entite-odc',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    EmrPhoneInputModule,
    MatInput,
    MatCardModule,
    FormsModule,
    MatOption,
    MatSelect,
    MatCheckbox,
  ],
  templateUrl: './entite-odc.component.html',
  styleUrl: './entite-odc.component.scss'
})
export class EntiteODCComponent {
  entiteList!: Entite[];
  selectedEntite!: Entite;
  entiteToAdd!: Entite;
  selectedFile: File | null = null;
  activiteCount: { [key: number]: number } = {}
  utilisateur: Utilisateur[] = [];
  selectedUtilisateur: Utilisateur | null = null; // Déclaration de la variable pour stocker l'utilisateur sélectionné


  isFormVisible: boolean = false;
  isTableVisible: boolean = true;
  isEditMode = false;

  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
    this.isTableVisible = !this.isTableVisible; // Basculer la visibilité de la table
  }


  searchTerm: string = '';

  itemsPerPage = 5; // Nombre d'éléments par page
  currentPage = 1; // Page actuelle

  get filteredEntite() {
    if (!this.entiteList || this.entiteList.length === 0) {
      return []; // Retourner un tableau vide si utilisateurList n'est pas défini ou vide
    }
    if (!this.searchTerm) {
      return this.entiteList;
    }
    return this.entiteList.filter(element =>
      element.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get paginatedEntite() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEntite.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredEntite.length / this.itemsPerPage) || 0; // Retourner 0 si la longueur est 0
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
    private entiteService: EntiteOdcService,
    private snackBar: MatSnackBar,
    private router: Router) {
    this.entiteToAdd = new Entite();
  }

  viewEntiteDetails(entite: any): void {
    this.router.navigate(['admin/entite-detail', entite.id]);
  }

  ngOnInit(): void {
    this.getAllEntite();
    this.getAllUtilisateur();
  }

  getAllEntite(): void {
    this.globalService.get("entite").subscribe({
      next: (value) => {
        this.entiteList = value; // Récupérer la liste des entités

        this.entiteList.forEach(entite => {
          if (entite?.id !== undefined) { // Vérification que l'ID n'est pas indéfini et que l'entité est bien définie
            this.getNombreActivites(entite.id); // Appel pour récupérer le nombre d'activités
          }
        });
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des entités : ", err);
        if (err.status === 403) {
          console.log("Accès refusé. Veuillez vérifier vos permissions.");
        }
      }
    });
  }

  getAllUtilisateur() {
    this.globalService.get("utilisateur").subscribe({
      next: (value) => {
        console.log("Réponse brute de l'API :", value); // Log de la réponse brute
        this.utilisateur = value;

        // Vérifiez que la réponse est un tableau
        if (Array.isArray(value)) {
          // Filtrer les utilisateurs ayant le rôle "Personnel"
          const personnelUtilisateurs = value.filter(user => user.role === 'Personnel');
          console.log("Réponse:", personnelUtilisateurs);
          // Vérifiez si des utilisateurs avec le rôle "Personnel" sont trouvés
          if (personnelUtilisateurs.length > 0) {
            console.log("Utilisateurs avec le rôle 'Personnel':", personnelUtilisateurs);
          } else {
            console.log("Aucun utilisateur avec le rôle 'Personnel' trouvé.");
          }
        } else {
          console.error("La réponse n'est pas un tableau :", value);
        }
      },
      error: (err: any) => {
        console.error("Erreur lors de la récupération des utilisateurs :", err);
      }
    });
  }





  getNombreActivites(entiteId: number): void {
    this.entiteService.getNombreActivites(entiteId).subscribe(count => {
      this.activiteCount[entiteId] = count; // Stocker le nombre d'activités dans le dictionnaire
    });
  }


  // Méthode pour afficher le formulaire pour ajouter un nouvel utilisateur ou modifier un utilisateur existant
  modifierEntite(entite: Entite) {
    this.isEditMode = true; // Activer le mode édition
    this.entiteToAdd = { ...entite }; // Remplir le formulaire avec les données de l'utilisateur sélectionné
    this.toggleForm(); // Afficher le formulaire
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  ajouterEntite() {
    const formData = new FormData();

    // Ajoutez les propriétés de l'entité
    formData.append('entiteOdc', new Blob([JSON.stringify(this.entiteToAdd)], { type: 'application/json' }));

    // Ajoutez le fichier (si disponible)
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    // Vérifiez que l'utilisateur sélectionné est disponible et ajoutez son ID
    if (this.selectedUtilisateur && this.selectedUtilisateur.id) {
      formData.append('utilisateurId', this.selectedUtilisateur.id.toString()); // Utilisez l'ID de l'utilisateur
    } else {
      console.error("Aucun utilisateur sélectionné ou ID non disponible.");
      // Gérez l'erreur ou faites une action appropriée
      return; // Arrêtez l'exécution si aucun utilisateur n'est sélectionné
    }

    if (this.isEditMode) {
      // Mode édition
      this.globalService.update("entite", this.entiteToAdd.id!, formData).subscribe({
        next: (data) => {
          console.log(data);
          this.getAllEntite();
          this.snackBar.open("Succès", "Modifié avec succès.", { duration: 3000 });
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open("Erreur", "Erreur lors de la modification : " + (err.error?.message || 'Erreur inconnue'), { duration: 3000 });
        }
      });
    } else {
      // Mode ajout
      this.globalService.post("entite", formData).subscribe({
        next: (data) => {
          console.log(data);
          this.getAllEntite();
          this.snackBar.open("Succès", "Ajouté avec succès.", { duration: 3000 });
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open("Erreur", "Erreur lors de l'ajout : " + (err.error?.message || 'Erreur inconnue'), { duration: 3000 });
        }
      });
    }
  }


  // Réinitialiser le formulaire après ajout ou modification
  resetForm() {
    this.isEditMode = false; // Désactiver le mode édition
    this.entiteToAdd = new Entite(); // Réinitialiser à une nouvelle instance
    this.isFormVisible = false; // Cacher le formulaire
    this.isTableVisible = true; // Afficher la table
  }

  supprimerEntite(selectedEntite: Entite ) {
    this.globalService.delete("utilisateur", selectedEntite.id!).subscribe(
      {
        next: () => {
          this.snackBar.open("Succès","Suppresion effectue avec success.", {duration: 3000});
          this.getAllEntite();
        },
        error: (err) => {
          console.log(err);
          this.snackBar.open("Erreur","Erreur lors de la suppression.", {duration: 3000});
        }
      }
    )
  }

}
