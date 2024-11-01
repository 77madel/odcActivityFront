import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {Activity} from '../../model/Activity';
import {Participant} from "../../model/Participant";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ParticipantService} from "../../service/participant/participant.service";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {GlobalCrudService} from '../../service/global.service';
import { Etape } from '../../model/Etape';
import { HttpClient } from '@angular/common/http';
import { EtapeService } from '../../service/etape/etape.service';

@Component({
  selector: 'app-participant',
  standalone: true,
  imports: [
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
    ReactiveFormsModule,
    FormsModule,
    NgClass
  ],
  templateUrl: './participant.component.html',
  styleUrl: './participant.component.scss'
})
export class ParticipantComponent {

  displayedColumns: string[] = ['nom','prenom','email','phone','genre','Activite','actions'];

  formData: any = {
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    genre: '',
    activite: Activity,
  };

  participants: Participant[]=[];
  activites: Activity[];
  etape: Etape[] = []; // Initialise le tableau d'étapes
  allEtapes: Etape[] = [];
  searchTerm: string = '';
  searchActivite: number | undefined = undefined;
  searchListeDebutParticipant: string = '';
  searchListeResultatParticipant: string = '';
  searchEtape: string = '';
  isEtapeSelected: boolean = false; // Indique si une étape a été sélectionnée

  // Nouvelle propriété pour le type de liste
  searchListType: string = ''; // Pour filtrer par nom dans listeResultat

  itemsPerPage = 5; // Nombre d'éléments par page
  currentPage = 1; // Page actuelle

  /*get filteredParticipants(): Participant[] {
    return this.participants.filter(participant => {
      const matchNomPrenom = participant.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        participant.prenom.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchActivite = this.searchActivite ?
        (participant.activite && participant.activite.nom.toLowerCase().includes(this.searchActivite.toLowerCase()))
        : true;

      const matchListeDebut = this.searchListeDebut ?
        (participant.activite && participant.activite.entite && participant.activite.entite.listeDebut.toLowerCase().includes(this.searchListeDebut.toLowerCase()))
        : true;

      const matchListeResultat = this.searchListeResultat ?
        (participant.activite && participant.activite.entite && participant.activite.entite.listeResultat.toLowerCase().includes(this.searchListeResultat.toLowerCase()))
        : true;

      return matchNomPrenom && matchActivite && matchListeDebut && matchListeResultat;
    });
  }*/




  // Filtered Participants
  onEtapeChange(): void {
    // Activer l'affichage de la liste uniquement si une étape est sélectionnée
    this.isEtapeSelected = !!this.searchEtape;
    // Réinitialiser le type de liste si aucune étape n'est sélectionnée
    if (!this.isEtapeSelected) {
      this.searchListType = '';
    }
  }

  get filteredParticipants(): Participant[] {
    return this.participants.filter(participant => {
      // Filtrage par nom, prénom ou téléphone
      const searchMatches = !this.searchTerm ||
        participant.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        participant.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        participant.phone.includes(this.searchTerm);

      // Filtrage par activité
      const activiteMatches = !this.searchActivite ||
        (participant.activite && participant.activite.id === Number(this.searchActivite));

      // Filtrage par étape
      const etapeMatches = !this.searchEtape ||
        (participant.activite && participant.activite.etape.some((etape: Etape) => etape.nom === this.searchEtape));

      // Filtrage par liste
      const listeMatches = !this.searchListType ||
        (participant.activite && participant.activite.etape.some((etape: Etape) => {
          if (this.searchListType === 'listeDebut') {
            return etape.listeDebut; // Vérifie que `listeDebut` est true
          } else if (this.searchListType === 'listeResultat') {
            return etape.listeResultat; // Vérifie que `listeResultat` est true
          }
          return false;
        }));

      // Retourner le résultat de tous les filtres
      return searchMatches && activiteMatches && etapeMatches && listeMatches;
    });
  }









  get filteredEtapes(): Etape[] {
    const selectedActivite = this.activites.find(a => a.id === this.searchActivite);
    return selectedActivite ? selectedActivite.etape : [];
  }



  get paginatedParticipants() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredParticipants.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredParticipants.length / this.itemsPerPage);
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

  isFormVisible: boolean = false;
  isTableVisible: boolean = true; // Contrôle la visibilité de la table
  addElementForm: FormGroup;
  isEditMode = false;
  currentParticipantsId: number | null = null;
  blacklistedEmails: string[] = [];
  blacklistedPhones: string[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private readonly participantService: ParticipantService,
    private readonly globalService: GlobalCrudService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private etapeService:EtapeService
  ) {
    this.addElementForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      genre: ['', Validators.required],
      activites: ['', Validators.required],
    });
  }

  // Fonction pour basculer l'affichage du formulaire et de la table
  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
    this.isTableVisible = !this.isTableVisible; // Basculer la visibilité de la table
  }


  participantExists(email: string, phone: string): boolean {
    return this.participants.some(participant =>
      participant.email === email || participant.phone === phone
    );
  }

  checkForExistingParticipants(): void {
    const existingParticipantEmails = this.participants.map(participant => participant.email);
    const existingParticipantPhones = this.participants.map(participant => participant.phone);

    if (existingParticipantEmails.length > 0) {
      this.snackBar.open("Certains participants sont déjà enregistrés.", 'OK', { duration: 3000 });
    }
  }

  async fetchElements() {
    try {
      const response = await this.participantService.get();
      this.participants = response.map((participant: Participant) => ({
        ...participant,
        activite: participant.activite || null,
        isBlacklisted: this.checkIfBlacklisted(participant) // Définissez si le participant est blacklisté
      }));
    } catch (error: any) {
      this.snackBar.open(error.message, 'Fermer', { duration: 3000 });
    }
  }

  fetchBlacklistedParticipants(): void {
    this.globalService.get('blacklist').subscribe({
      next: (data) => {
        console.log('data', data);
        this.blacklistedEmails = data.map((item: { email: any; }) => item.email);
        this.blacklistedPhones = data.map((item: { phone: any; }) => item.phone);
      },
      error: (err) => {
        this.snackBar.open("Erreur lors de la récupération des participants blacklistés.", 'Fermer', { duration: 3000 });
      }
    });
  }

  checkIfBlacklisted(participant: Participant): boolean {
    const isEmailBlacklisted = this.blacklistedEmails.includes(participant.email.toLowerCase());
    const isPhoneBlacklisted = this.blacklistedPhones.includes(participant.phone);

    return isEmailBlacklisted || isPhoneBlacklisted;
  }

  async fetchEtape(): Promise<void> {
    try {
      const response = await this.etapeService.get();
      this.etape = response;
      console.log("Etape",this.etape)
    } catch (error) {
      this.snackBar.open("Erreur",'Une erreur est survenue lors de la récupération des données.', {duration: 4000});
    }
  }



  fetch(){
    this.globalService.get("activite").subscribe({
      next: value => {
        this.activites = value
        console.log("Activite Test",this.activites)
      },
      error: err => {
        console.log(err);
      }
    })
  }


  apiUrl = 'http://localhost:8080';

  onCheckInChange(participant: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      // Vérifiez si le participant a déjà été checké
      if (participant.checkedIn) {
        console.warn('Participant déjà checké.');
        // Réinitialiser l'état du checkbox à false si déjà checké
        (event.target as HTMLInputElement).checked = false;
        return; // Ne pas procéder au check-in
      }

      this.http.post(`${this.apiUrl}/participant/check-in/${participant.id}`, {}).subscribe(
        (response) => {
          console.log('Check-in réussi:', response);
          participant.checkedIn = true; // Mettre à jour l'état localement
        },
        (error) => {
          console.error('Erreur lors du check-in:', error);
          participant.checkedIn = false; // Revenir à l'état non coché en cas d'erreur
          (event.target as HTMLInputElement).checked = false; // Reinitialiser le checkbox
        }
      );
    } else {
      console.warn('Participant non coché, pas de check-in effectué');
      participant.checkedIn = false; // Mettre à jour l'état localement
    }
  }

  validateCheckIns() {
    // Filtrer les participants qui ont été check-in
    const checkedInParticipants = this.paginatedParticipants.filter(participant => participant.checkedIn);

    // Vérifier si au moins un participant a été sélectionné
    if (checkedInParticipants.length === 0) {
      alert("Veuillez sélectionner au moins un participant.");
      return;
    }


    // Envoyer les requêtes de check-in pour chaque participant sélectionné
    checkedInParticipants.forEach(participant => {
      this.http.post(`${this.apiUrl}/participant/check-in/${participant.id}`, {}).subscribe(
        response => {
          console.log(`Check-in réussi pour ${participant.nom}`, response);
          participant.checkedIn = true; // ou false selon votre logique
        },
        error => {
          console.error(`Erreur lors du check-in pour ${participant.nom}:`, error);
          alert(`Erreur lors du check-in pour ${participant.nom}: ${error.message}`);
        }
      );
    });

    alert("Check-ins validés avec succès !");
  }





  ngOnInit(): void {
    this.fetchElements();
    this.fetch();
    this.fetchEtape();
    this.fetchBlacklistedParticipants();
  }


}
