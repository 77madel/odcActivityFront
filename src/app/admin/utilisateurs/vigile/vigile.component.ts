import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonModule} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {EmrPhoneInputModule} from "@elementar/components/phone-input";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule, MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {Vigile} from "../../../model/Vigile";
import {VigileService} from "../../../service/vigile/vigile.service";

@Component({
  selector: 'app-vigile',
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
  templateUrl: './vigile.component.html',
  styleUrl: './vigile.component.scss'
})
export class VigileComponent {

  displayedColumns: string[] = ['nom','prenom','email','phone','genre','actions'];

  formData: any = {
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    genre: '',
  };

  vigile: Vigile[]=[];
  searchTerm: string = '';



  itemsPerPage = 5; // Nombre d'éléments par page
  currentPage = 1; // Page actuelle

  get filteredVigile() {
    if (!this.searchTerm) {
      return this.vigile;
    }
    return this.vigile.filter(element =>
      element.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      element.phone.includes(this.searchTerm) // Ajoutez d'autres propriétés si nécessaire
    );
  }

  get paginatedVigile() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVigile.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredVigile.length / this.itemsPerPage);
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
    private readonly vigileService: VigileService,
    private snackBar: MatSnackBar,
  ) {
    this.addElementForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      genre: ['', Validators.required],
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
        response = await this.vigileService.update(this.currentPersonnelId, this.formData);
        console.log("resp",response);

        // Mise à jour du tableau local après modification
        this.vigile = this.vigile.map(vigile => vigile.id === this.currentPersonnelId ? response : vigile);

        this.snackBar.open("Succes", "Modifier", {duration: 3000} );


      } else {
        // Sinon, on ajoute un nouveau rôle
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        response = await this.vigileService.add(this.formData);
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


  async fetchElements() {
    try {
     // const token: any = localStorage.getItem();
      const response = await this.vigileService.get();
      if (response) {
        this.vigile = response;
      } else {
        this.showError('No users found.');
      }
    } catch (error: any) {
      this.showError(error.message);
    }
  }

  async onDelete(id: number | undefined): Promise<void> {
    const confirmDeletion = confirm('Êtes-vous sûr de vouloir supprimer cette entite ?');
    if (!confirmDeletion) {
      return;
    }

    try {
      const response = await this.vigileService.delete(id);
      this.vigile = response;
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
  }

}
