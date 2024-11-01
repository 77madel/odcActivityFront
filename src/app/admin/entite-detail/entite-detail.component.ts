import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { GlobalCrudService } from '../../service/global.service';
import { Entite } from '../../model/Entite';
import { CommonModule } from '@angular/common'; // Import de CommonModule

@Component({
  selector: 'app-entite-detail',
  standalone: true,
  imports: [CommonModule], // Ajout de CommonModule ici
  templateUrl: './entite-detail.component.html',
  styleUrls: ['./entite-detail.component.scss'], // Correction de styleUrl à styleUrls
})
export class EntiteDetailComponent {
  entite: Entite | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalService: GlobalCrudService,
  ) {}

  back(): void {
    this.router.navigate(['admin/entite-odc']);
  }

  ngOnInit(): void {
    const entiteId = this.route.snapshot.paramMap.get('id');
    if (entiteId) {
      this.globalService.getById('entite', entiteId).subscribe((data) => {
        this.entite = data;
        console.log(this.entite?.responsable.nom);
      });
    }
  }
}
