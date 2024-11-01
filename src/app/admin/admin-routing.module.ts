import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuardService} from "../service/auth/guard/auth-guard.service";

const routes: Routes = [
  {
    path: 'role',
    loadComponent: () => import('./role/role.component').then(c => c.RoleComponent),
    canActivate:[AuthGuardService]
  },
  {
    path: 'entite-odc',
    loadComponent: () => import('./entite-odc/entite-odc.component').then(c =>c.EntiteODCComponent),
    canActivate:[AuthGuardService]
  },

  {
    path: 'personnel',
    loadComponent: () => import('./utilisateurs/personnel/personnel.component').then(c =>c.PersonnelComponent),
    canActivate:[AuthGuardService]
  },
  {
    path: 'vigile',
    loadComponent: () => import('./utilisateurs/vigile/vigile.component').then(c =>c.VigileComponent),
    canActivate:[AuthGuardService]
  },
  {
    path: 'employer',
    loadComponent: () => import('./utilisateurs/employer/employer/employer.component').then(c =>c.EmployerComponent),
    canActivate:[AuthGuardService]
  },
  {
    path: 'entite-detail/:id',
    loadComponent: () => import('./entite-detail/entite-detail.component').then(c =>c.EntiteDetailComponent),
    canActivate:[AuthGuardService]
  }



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
