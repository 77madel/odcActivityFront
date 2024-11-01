import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {EmrPhoneInputModule} from "@elementar/components/phone-input";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule, MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Entite} from "../../../model/Entite";
import {Utilisateur} from "../../../model/Utilisateur";
import {EntiteOdcService} from "../../../service/entite/entite-odc.service";
import {PersonnelService} from "../../../service/utilisateur/personnel.service";
import {Personnel} from "../../../model/Personnel";
import {HttpHeaders} from "@angular/common/http";
import {lastValueFrom} from "rxjs";


@Component({
  selector: 'app-personnel',
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
    MatOption,
    MatSelect,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './personnel.component.html',
  styleUrl: './personnel.component.scss'
})
export class PersonnelComponent {

  displayedColumns: string[] = ['nom','prenom','email','phone','genre','entite','actions'];

  formData: any = {
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    genre: '',
    entite: Entite,
  };

  personnel: Personnel[]=[];
  entite: Entite[]=[];
  searchTerm: string = '';



  itemsPerPage = 5; // Nombre d'éléments par page
  currentPage = 1; // Page actuelle

  get filteredPersonnel() {
    if (!this.searchTerm) {
      return this.personnel;
    }
    return this.personnel.filter(element =>
      element.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.phone.includes(this.searchTerm) // Ajoutez d'autres propriétés si nécessaire
    );
  }

  get paginatedPersonnel() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPersonnel.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredPersonnel.length / this.itemsPerPage);
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

  errorMessage: string = '';

  genre: string[] = ['Homme', 'Femme'];


  isFormVisible: boolean = false;
  isTableVisible: boolean = true; // Contrôle la visibilité de la table
  addElementForm: FormGroup;
  isEditMode = false;
  currentPersonnelId: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private readonly personnelService: PersonnelService,
    private readonly entiteService: EntiteOdcService,
    private snackBar: MatSnackBar,
  ) {
    this.addElementForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      genre: ['', Validators.required],
      entite: ['', Validators.required],
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
      if (this.isEditMode && this.currentPersonnelId) {
        // Si en mode édition, on modifie le rôle existant
        response = await this.personnelService.update(this.currentPersonnelId, this.formData, this.formData.entite);
        console.log("resp",response);

        // Mise à jour du tableau local après modification
        this.personnel = this.personnel.map(personnel => personnel.id === this.currentPersonnelId ? response : personnel);

        this.snackBar.open("Succes", "Modifier", {duration: 3000} );


      } else {
        // Sinon, on ajoute un nouveau rôle
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        response = await this.personnelService.add(this.formData, this.formData.entite, token);
        this.snackBar.open("Succes", "Ajout avec succes", {duration: 3000});
        // Ajouter le nouveau rôle au tableau local
        //this.personnel.push(response);
        this.fetchElements();
      }

      // Réinitialiser le formulaire après l'ajout ou la modification
      this.addElementForm.reset();
      this.isFormVisible = false; // Fermer le formulaire
      this.isTableVisible = true; // Afficher le tableau

    } catch (error: any) {
      this.showError(error.message);
    }
  }

  onEdit(personnel: any): void {
    this.isEditMode = true;
    this.currentPersonnelId = personnel.id; // Stocker l'ID du rôle en cours de modification
    this.formData = { ...personnel }; // Préremplir le formulaire avec les données existantes
    this.isFormVisible = true; // Afficher le formulaire
    this.isTableVisible = false; // Masquer le tableau
  }


  // async fetchElements(): Promise<void> {
  //   try {
  //     // Vérifiez si l'environnement est un navigateur
  //     if (isPlatformBrowser(this.platformId)) {
  //       const token = localStorage.getItem('token');
  //
  //       if (!token) {
  //         throw new Error('Token non trouvé');
  //       }
  //
  //       const headers = new HttpHeaders({
  //         'Authorization': `Bearer ${token}`
  //       });
  //
  //       // Utilisation de lastValueFrom pour convertir l'observable en promesse
  //       const response = await lastValueFrom(await this.personnelService.get(headers));
  //       this.fetch();
  //     } else {
  //       console.warn('localStorage n\'est pas disponible dans cet environnement.');
  //     }
  //   } catch (error) {
  //     console.error('Erreur lors de la récupération des entités:', error);
  //     this.showError('Une erreur est survenue lors de la récupération des entités.');
  //   }
  // }

  async fetchElements() {
    try {
      const token: any = localStorage.getItem('token');
      const response = await this.personnelService.get(token);
      if (response) {
        this.personnel = response;
      } else {
        this.showError('No users found.');
      }
    } catch (error: any) {
      this.showError(error.message);
    }
  }



  async fetch(): Promise<void> {
    try {
      const response = await this.entiteService.get();
      this.entite = response;

    } catch (error) {
      this.showError('Une erreur est survenue lors de la récupération des entites.');
    }
  }


  async onDelete(id: number | undefined): Promise<void> {
    const confirmDeletion = confirm('Êtes-vous sûr de vouloir supprimer cette entite ?');
    if (!confirmDeletion) {
      return;
    }

    try {
      const response = await this.personnelService.delete(id);
      this.personnel = response;
      this.fetchElements();
      // if (!response) {
      //   this.showError('Aucune réponse du serveur');
      //   return;
      // }
      this.snackBar.open("Succes", "supprimer", {duration: 3000});


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
    this.fetchElements();
    this.fetch();
  }

}
