import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Etape } from '../../model/Etape';
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { EmrPhoneInputModule } from "@elementar/components/phone-input";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { EtapeService } from '../../service/etape/etape.service';
import { CritereService } from "../../service/critere/critere.service";
import { Critere } from '../../model/Critere';
import {Activity} from "../../model/Activity";
import { GlobalCrudService } from '../../service/global.service';

interface EtapeDTO {
  id: number;
  nom: string;
  statut: string;
  listeDebut: [];
  listeResultat: [];
}

@Component({
  selector: 'app-etape',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    EmrPhoneInputModule,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './etape.component.html',
  styleUrls: ['./etape.component.scss']
})
export class EtapeComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'statut', 'critere', 'actions'];
  nouvelleEtape: EtapeDTO = { id: 0, nom: '', statut: '', listeDebut: [], listeResultat: [] };
  selectedFile: File | null = null;
  uploadForm: FormGroup;
  addElementForm: FormGroup;
  errorMessage: string = '';
  isUploadFormVisible: boolean = false;
  isFormVisible: boolean = false;
  isTableVisible: boolean = true;
  isEditMode = false;
  currentEtapeId: number;
  currentEtapeNom: string | null = null;
  uploading: boolean = false;

  statutOptions: string[] = ['En_Attente', 'En_Cours', 'Termine'];
  etapes: Etape[] = [];
  criteres: Critere[] = [];

  itemsPerPage = 5;
  currentPage = 1;

  constructor(
    private fb: FormBuilder,
    private etapeService: EtapeService,
    private globalService: GlobalCrudService,
    private snackBar: MatSnackBar,
    private critereService: CritereService
  ) {
    this.addElementForm = this.fb.group({
      nom: ['', Validators.required],
      statut: ['', Validators.required],
      critere: ['', Validators.required],
    });
  }

  get paginatedEtapes() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.etapes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.etapes.length / this.itemsPerPage);
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

  ngOnInit(): void {
    this.fetchElements();
    this.fetchCriteres();
  }

  openUploadForm(etapeId: number | undefined, etapeNom: string | undefined) {
    if (etapeId !== undefined && etapeNom !== undefined) {
      this.currentEtapeId = etapeId;
      this.currentEtapeNom = etapeNom;
      this.isUploadFormVisible = true;
      this.isFormVisible = false;
      this.isTableVisible = false;
    } else {
      console.error('L\'ID ou le nom de l\'étape ne peut pas être indéfini.');
    }
  }

  toggleForm() {
    this.isFormVisible = !this.isFormVisible; // Alterne la visibilité du formulaire
    this.isUploadFormVisible = false; // Assurez-vous que le formulaire d'upload est caché
  }
  showUploadForm() {
    this.isUploadFormVisible = true; // Afficher le formulaire d'upload
    this.isFormVisible = false; // Masquer le formulaire d'ajout/modification
  }


  resetForm() {
    this.isEditMode = false;
    this.isFormVisible = false;
    this.isTableVisible = true;
  }

  async handleSubmit() {
    console.log("Formulaire soumis :", this.addElementForm.value);

    if (this.addElementForm.invalid) {
      this.showError('Veuillez remplir tous les champs.');
      return;
    }

    const confirmMessage = this.isEditMode
      ? 'Êtes-vous sûr de vouloir modifier cet élément ?'
      : 'Êtes-vous sûr de vouloir enregistrer ?';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const formData: Etape = this.addElementForm.value;
      console.log("Données du formulaire :", formData);

      let response: Etape | Etape[] | undefined;

      if (this.isEditMode && this.currentEtapeId) {
        console.log("Modification de l'étape avec ID :", this.currentEtapeId);
        response = await this.etapeService.update(this.currentEtapeId, formData);
        console.log("Réponse de mise à jour :", response);

        if (response && !Array.isArray(response)) {
          this.etapes = this.etapes.map(etape =>
            etape.id === this.currentEtapeId ? response as Etape : etape
          );
          this.snackBar.open("Succès", "Modification réussie", { duration: 3000 });
        } else {
          this.showError("Erreur lors de la mise à jour de l'étape.");
        }
      } else {
        // Ajout d'une nouvelle étape
        response = await this.etapeService.add([formData]);
        console.log("Réponse d'ajout :", response);
        if (Array.isArray(response)) {
          this.etapes.push(...response);
          this.snackBar.open("Succès", "Ajout avec succès", { duration: 3000 });
        } else {
          this.showError("Erreur lors de l'ajout des étapes.");
        }
      }

      this.addElementForm.reset();
      this.isFormVisible = false;
      this.isTableVisible = true;
      this.isEditMode = false; // Réinitialiser le mode d'édition
      this.currentEtapeId = 0; // Réinitialiser l'ID après modification
    } catch (error: any) {
      console.error("Erreur lors de l'ajout ou de la modification:", error);
      this.showError("Une erreur s'est produite : " + error.message);
    }
  }


  selectedElement: any; // Créez une propriété pour stocker l'élément sélectionné

  onEdit(element: any) {
    this.isEditMode = true;
    this.selectedElement = element; // Stockez l'élément pour l'utiliser dans le formulaire
    this.addElementForm.patchValue({
      nom: element.nom,
      critere: element.critere,
      statut: element.statut
    });
    this.toggleForm(); // Affiche le formulaire
  }


  getAllNombre(name: string, id:number){
    this.globalService.getId("activite/get", this.currentEtapeId).subscribe({
      next: value => {
        this.etapes = value
      },
      error: err => {
        console.log(err);
      }
    })
  }

  async fetchElements(): Promise<void> {
    try {
      const response = await this.etapeService.get();
      this.etapes = response;
    } catch (error) {
      this.showError('Une erreur est survenue lors de la récupération des données.');
    }
  }

  async fetchCriteres(): Promise<void> {
    try {
      const response = await this.critereService.get();
      this.criteres = response;
    } catch (error) {
      this.showError('Une erreur est survenue lors de la récupération des critères.');
    }
  }

  async onDelete(id: number | undefined): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    try {
      await this.etapeService.delete(id);
      this.snackBar.open("Succès", "Supprimé", { duration: 3000 });
      this.fetchElements();
    } catch (error) {
      this.showError('Erreur lors de la suppression.');
    }
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      console.log(`Fichier sélectionné : ${this.selectedFile.name}`);
    }
  }


  uploadParticipants(id: number, toListeDebut: boolean) {
    if (id === 0) {
      console.error('Erreur : ID de l\'étape est 0, impossible de continuer');
      this.errorMessage = 'ID de l\'étape invalide.';
      return;
    }

    // Vérifiez si un upload est déjà en cours
    if (this.uploading) {
      console.warn('Un upload est déjà en cours, veuillez attendre.');
      return;
    }

    if (this.selectedFile) {
      this.uploading = true; // Début de l'upload

      this.etapeService.uploadParticipants(id, this.selectedFile, toListeDebut).subscribe({
        next: () => {
          this.snackBar.open("Succès", "Participants ajoutés avec succès", { duration: 3000 });
          this.fetchElements(); // Met à jour la liste des étapes

          // Réinitialiser le fichier sélectionné
          this.selectedFile = null;

          // Masquer le formulaire d'upload et afficher la table
          this.isUploadFormVisible = false;
          this.isTableVisible = true; // Assurez-vous que cette variable est définie correctement

          this.uploading = false; // Fin de l'upload
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout des participants', err);
          this.errorMessage = err.error?.message || 'Erreur lors de l\'ajout des participants. Veuillez réessayer.';
          this.uploading = false; // Fin de l'upload même en cas d'erreur
        }
      });
    } else {
      console.error('Aucun fichier sélectionné');
      this.errorMessage = 'Veuillez sélectionner un fichier avant de continuer.';
    }
  }


  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }


}













  /*// Gère le changement de fichier
  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      console.log(`Fichier sélectionné : ${this.selectedFile.name}`);
    }
  }*/

/*// Méthode pour uploader des participants
  uploadParticipants(id: number, toListeDebut: boolean) {
    if (id === 0) {
      console.error('Erreur : ID de l\'étape est 0, impossible de continuer');
      this.errorMessage = 'ID de l\'étape invalide.';
      return;
    }

    // Vérifiez si un upload est déjà en cours
    if (this.uploading) {
      console.warn('Un upload est déjà en cours, veuillez attendre.');
      return;
    }

    if (this.selectedFile) {
      this.uploading = true; // Début de l'upload

      this.etapeService.uploadParticipants(id, this.selectedFile, toListeDebut).subscribe({
        next: () => {
          this.snackBar.open("Succès", "Participants ajoutés avec succès", { duration: 3000 });
          this.fetchElements(); // Met à jour la liste des étapes

          // Réinitialiser le fichier sélectionné
          this.selectedFile = null;

          // Masquer le formulaire d'upload et afficher la table
          this.isUploadFormVisible = false;
          this.isTableVisible = true; // Assurez-vous que cette variable est définie correctement

          this.uploading = false; // Fin de l'upload
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout des participants', err);
          this.errorMessage = err.error?.message || 'Erreur lors de l\'ajout des participants. Veuillez réessayer.';
          this.uploading = false; // Fin de l'upload même en cas d'erreur
        }
      });
    } else {
      console.error('Aucun fichier sélectionné');
      this.errorMessage = 'Veuillez sélectionner un fichier avant de continuer.';
    }
  }*/


/*this.uploadForm = this.fb.group({
      step: [null, Validators.required] // Assurez-vous que cette propriété est correcte
    });*/



/*openUploadForm(etapeId: number | undefined, etapeNom: string | undefined) {
    if (etapeId !== undefined && etapeNom !== undefined) {
      this.currentEtapeId = etapeId;
      this.currentEtapeNom = etapeNom; // Assurez-vous d'assigner le nom de l'étape
      this.isUploadFormVisible = true; // Affiche le formulaire d'upload
      this.isFormVisible = false; // Masque le formulaire d'ajout
      this.  isTableVisible = false; // Masque le formulaire d'ajout
    } else {
      console.error('L\'ID ou le nom de l\'étape ne peut pas être indéfini.');
    }
  }*/

/*
get paginatedEtapes() {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  return this.etapes.slice(startIndex, startIndex + this.itemsPerPage);
}

get totalPages() {
  return Math.ceil(this.etapes.length / this.itemsPerPage);
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
}*/


/*// Gère le changement de fichier
  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      console.log(`Fichier sélectionné : ${this.selectedFile.name}`);
    }
  }*/

/*// Méthode pour uploader des participants
  uploadParticipants(id: number, toListeDebut: boolean) {
    if (id === 0) {
      console.error('Erreur : ID de l\'étape est 0, impossible de continuer');
      this.errorMessage = 'ID de l\'étape invalide.';
      return;
    }

    // Vérifiez si un upload est déjà en cours
    if (this.uploading) {
      console.warn('Un upload est déjà en cours, veuillez attendre.');
      return;
    }

    if (this.selectedFile) {
      this.uploading = true; // Début de l'upload

      this.etapeService.uploadParticipants(id, this.selectedFile, toListeDebut).subscribe({
        next: () => {
          this.snackBar.open("Succès", "Participants ajoutés avec succès", { duration: 3000 });
          this.fetchElements(); // Met à jour la liste des étapes

          // Réinitialiser le fichier sélectionné
          this.selectedFile = null;

          // Masquer le formulaire d'upload et afficher la table
          this.isUploadFormVisible = false;
          this.isTableVisible = true; // Assurez-vous que cette variable est définie correctement

          this.uploading = false; // Fin de l'upload
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout des participants', err);
          this.errorMessage = err.error?.message || 'Erreur lors de l\'ajout des participants. Veuillez réessayer.';
          this.uploading = false; // Fin de l'upload même en cas d'erreur
        }
      });
    } else {
      console.error('Aucun fichier sélectionné');
      this.errorMessage = 'Veuillez sélectionner un fichier avant de continuer.';
    }
  }*/
