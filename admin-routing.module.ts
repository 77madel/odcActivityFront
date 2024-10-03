import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'role',
    loadComponent: () => import('./role/role.component').then(c => c.RoleComponent)
  },
  {
    path: 'entite-odc',
    loadComponent: () => import('./entite-odc/entite-odc.component').then(c =>c.EntiteODCComponent)
  },
  {
    path: 'cours',
    loadComponent: () => import('./cours/cours.component').then(c =>c.CoursComponent)
  },
  {
    path: 'chapitre',
    loadComponent: () => import('./chapitre/chapitre.component').then(c =>c.ChapitreComponent)
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
