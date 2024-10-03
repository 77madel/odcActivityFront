import { Component } from '@angular/core';
import {Cours} from "../../model/Cours";
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
import {MatSelect} from "@angular/material/select";
import {Chapitre} from "../../model/Chapitre";
import {ChapitreService} from "../../service/chapitre/chapitre.service";
import {CoursService} from "../../service/cours/cours.service";

@Component({
  selector: 'app-chapitre',
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
    MatOption
  ],
  templateUrl: './chapitre.component.html',
  styleUrl: './chapitre.component.scss'
})
export class ChapitreComponent {

  displayedColumns: string[] = ['nom','cours', 'actions'];

  formData: any = {
    nom: '',
    cours: Cours,
  };

  chapitre: Chapitre[] = [];
  cours: Cours[] = [];

  errorMessage: string = '';

  isFormVisible: boolean = false;
  isTableVisible: boolean = true; // Contrôle la visibilité de la table
  addElementForm: FormGroup;
  isEditMode = false;
  currentRoleId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private readonly chapitreService: ChapitreService,
    private readonly router: Router,
    private snackBar: MatSnackBar,
    private coursService: CoursService,
  ) {
    this.addElementForm = this.fb.group({
      nom: ['', Validators.required],
      cours: ['', Validators.required],
    });
  }

  // Fonction pour basculer l'affichage du formulaire et de la table
  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
    this.isTableVisible = !this.isTableVisible; // Basculer la visibilité de la table
  }

  async handleSubmit() {
    // Vérifier si le champ "titre" est vide (au lieu de "nom")
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
        // Si en mode édition, on modifie le cours existant
        response = await this.chapitreService.update(this.currentRoleId, this.formData); // Correction de 'updqteCours'
        this.snackBar.open("Succès", "Modifier", {duration: 3000});

        // Mise à jour du tableau local après modification
        this.chapitre = this.chapitre.map(chapitre => chapitre.id === this.currentRoleId ? response : chapitre);
        this.fetchElements(); // Récupérer les données pour mettre à jour le tableau

      } else {
        // Sinon, on ajoute un nouveau cours
        response = await this.chapitreService.add(this.formData, this.formData.cours);
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

  onEdit(chapitre: any): void {
    this.isEditMode = true;
    this.currentRoleId = chapitre.id;
    this.formData = { ...chapitre };
    this.isFormVisible = true;
    this.isTableVisible = false;
  }

  async fetchElements(): Promise<void> {
    try {
      const response = await this.chapitreService.get();
      this.chapitre = response;
    } catch (error) {
      this.showError('Une erreur est survenue lors de la récupération des donnees.');
    }
  }

  async fetch(): Promise<void> {
    try {
      const response = await this.coursService.getAllCours();
      this.cours = response;
      console.log(this.cours)
    } catch (error) {
      this.showError('Une erreur est survenue lors de la récupération des cours.');
    }
  }

  async onDelete(id: number | undefined): Promise<void> { // Correction du nom pour cohérence
    const confirmDeletion = confirm('Êtes-vous sûr de vouloir supprimer ce donnee ?');
    if (!confirmDeletion) {
      return;
    }

    try {
      const response = await this.coursService.deleteCours(id);
      this.chapitre = response;
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
    this.fetch();
  }

}
