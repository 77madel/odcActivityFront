import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmrPhoneInputModule} from "@elementar/components/phone-input";
import {MatInput} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import { EntiteODC } from '../../model/EntiteODC';
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EntiteOdcService} from "../../service/entite/entite-odc.service";

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
  ],
  templateUrl: './entite-odc.component.html',
  styleUrl: './entite-odc.component.scss'
})
export class EntiteODCComponent {
  displayedColumns: string[] = ['nom', 'actions'];

  formData: any = {
    nom: ''
  };

  entite:EntiteODC[]=[];

  errorMessage: string = '';


  isFormVisible: boolean = false;
  isTableVisible: boolean = true; // Contrôle la visibilité de la table
  addElementForm: FormGroup;
  isEditMode = false;
  currentRoleId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private readonly entiteService: EntiteOdcService,
    private readonly router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.addElementForm = this.fb.group({
      nom: ['', Validators.required],
    });
  }

  // Fonction pour basculer l'affichage du formulaire et de la table
  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
    this.isTableVisible = !this.isTableVisible; // Basculer la visibilité de la table
  }

  async handleSubmit() {
    // Vérifier si le champ "nom" est vide
    if (!this.formData.nom) {
      this.showError('Veuillez remplir tous les champs.');
      return;
    }

    // Confirmation avant l'enregistrement
    const confirmRegistration = confirm(this.isEditMode ? 'Êtes-vous sûr de vouloir modifier cet élément ?' : 'Êtes-vous sûr de vouloir enregistrer ?');
    if (!confirmRegistration) {
      return;
    }

    try {
      let response: any;

      if (this.isEditMode && this.currentRoleId) {
        // Si en mode édition, on modifie le rôle existant
        response = await this.entiteService.updateEntite(this.currentRoleId, this.formData);
        this.snackBar.open("Succes", "Entite Modifier", {duration: 3000} );

        // Mise à jour du tableau local après modification
        this.entite = this.entite.map(entite => entite.id === this.currentRoleId ? response : entite);

      } else {
        // Sinon, on ajoute un nouveau rôle
        response = await this.entiteService.entite(this.formData);
        this.snackBar.open("Succes", "Entite ajouter avec succes", {duration: 3000});
        // Ajouter le nouveau rôle au tableau local
        this.entite.push(response);
      }

      // Réinitialiser le formulaire après l'ajout ou la modification
      this.addElementForm.reset();
      this.isFormVisible = false; // Fermer le formulaire
      this.isTableVisible = true; // Afficher le tableau

    } catch (error: any) {
      this.showError(error.message);
    }
  }

  onEditRole(role: any): void {
    this.isEditMode = true;
    this.currentRoleId = role.id; // Stocker l'ID du rôle en cours de modification
    this.formData = { ...role }; // Préremplir le formulaire avec les données existantes
    this.isFormVisible = true; // Afficher le formulaire
    this.isTableVisible = false; // Masquer le tableau
  }


  async fetchElements(): Promise<void> {
    try {
      const response = await this.entiteService.getAllEntite();
      this.entite = response;


    } catch (error) {
      this.showError('Une erreur est survenue lors de la récupération des entites.');
    }
  }


  async onDeleteRole(entiteId: number | undefined): Promise<void> {
    const confirmDeletion = confirm('Êtes-vous sûr de vouloir supprimer cette entite ?');
    if (!confirmDeletion) {
      return;
    }

    try {
      const response = await this.entiteService.deleteEntite(entiteId);
      this.entite = response;
      // if (!response) {
      //   this.showError('Aucune réponse du serveur');
      //   return;
      // }
      this.snackBar.open("Succes", "Entite supprimer", {duration: 3000});


    } catch (error) {
      this.showError('Erreur lors de la suppression d entite');
    }
  }



  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = ''; // Effacer le message d'erreur après un délai
    }, 3000);
  }




  ngOnInit(): void {
    this.fetchElements(); // Appel de la méthode pour récupérer les données au démarrage
  }

}
