import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonModule} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {EmrPhoneInputModule} from "@elementar/components/phone-input";
import {MatInput} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule, MatOption} from "@angular/material/core";
import {CoursService} from "../../service/cours/cours.service";
import {Cours} from "../../model/Cours";
import {MatSelect} from "@angular/material/select";
import {Activity} from "../../model/Activity";
import {ActiviteService} from "../../service/activity/activite.service";


@Component({
  selector: 'app-cours',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelect,
    MatOption,
  ],
  templateUrl: './cours.component.html',
  styleUrls: ['./cours.component.scss'] // Correction de 'styleUrl' en 'styleUrls'
})
export class CoursComponent {

  displayedColumns: string[] = ['titre','activite', 'actions'];

  formData: any = {
    titre: '', // Correction pour correspondre avec le formulaire
    activite: Activity,
  };

  cours: Cours[] = [];
  activity: Activity[] = [];

  errorMessage: string = '';

  isFormVisible: boolean = false;
  isTableVisible: boolean = true; // Contrôle la visibilité de la table
  addElementForm: FormGroup;
  isEditMode = false;
  currentRoleId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private readonly coursService: CoursService,
    private readonly router: Router,
    private snackBar: MatSnackBar,
    private activityService: ActiviteService,
  ) {
    this.addElementForm = this.fb.group({
      titre: ['', Validators.required],
      activite: ['', Validators.required],
    });
  }

  // Fonction pour basculer l'affichage du formulaire et de la table
  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
    this.isTableVisible = !this.isTableVisible; // Basculer la visibilité de la table
  }

  async handleSubmit() {
    // Vérifier si le champ "titre" est vide (au lieu de "nom")
    if (!this.formData.titre) {
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
        // Si en mode édition, on modifie le cours existant
        response = await this.coursService.updateCours(this.currentRoleId, this.formData); // Correction de 'updqteCours'
        this.snackBar.open("Succès", "Modifier", {duration: 3000});

        // Mise à jour du tableau local après modification
        this.cours = this.cours.map(cours => cours.id === this.currentRoleId ? response : cours);
        this.fetchElements();
      } else {
        // Sinon, on ajoute un nouveau cours
        response = await this.coursService.cours(this.formData, this.formData.activite);
        this.snackBar.open("Succès", "Ajout avec succès", {duration: 3000});
        // Ajouter le nouveau cours au tableau local
        this.cours.push(response);
      }

      // Réinitialiser le formulaire après l'ajout ou la modification
      this.addElementForm.reset();
      this.isFormVisible = false; // Fermer le formulaire
      this.isTableVisible = true; // Afficher le tableau

    } catch (error: any) {
      this.showError(error.message);
    }
  }

  onEditCours(cours: any): void { // Renommé pour cohérence
    this.isEditMode = true;
    this.currentRoleId = cours.id; // Stocker l'ID du cours en cours de modification
    this.formData = { ...cours }; // Préremplir le formulaire avec les données existantes
    this.isFormVisible = true; // Afficher le formulaire
    this.isTableVisible = false; // Masquer le tableau
  }

  async fetchElements(): Promise<void> {
    try {
      const response = await this.coursService.getAllCours();
      this.cours = response;

    } catch (error) {
      this.showError('Une erreur est survenue lors de la récupération des cours.');
    }
  }

  async fetchActivity(): Promise<void> {
    try {
      const response = await this.activityService.getAllActivity();
      this.activity = response;
      console.log(this.activity)

    } catch (error) {
      this.showError('Une erreur est survenue lors de la récupération des activités.');
    }
  }

  async onDeleteCours(coursId: number | undefined): Promise<void> { // Correction du nom pour cohérence
    const confirmDeletion = confirm('Êtes-vous sûr de vouloir supprimer ce cours ?');
    if (!confirmDeletion) {
      return;
    }

    try {
      const response = await this.coursService.deleteCours(coursId);
      this.cours = response;
      this.fetchElements();
      this.snackBar.open("Succès", "Supprimer", {duration: 3000});

    } catch (error) {
      this.showError('Erreur lors de la suppression du cours');
    }
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = ''; // Effacer le message d'erreur après un délai
    }, 3000);
  }

  ngOnInit(): void {
    this.fetchElements();
    this.fetchActivity();
  }

}
