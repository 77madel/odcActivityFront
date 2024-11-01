import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuardService} from "../service/auth/guard/auth-guard.service";

const routes: Routes = [
  {
    path: 'activity',
    loadComponent: () => import('../Personnels/activity/activity.component').then(c =>c.ActivityComponent),
    canActivate:[AuthGuardService]
  },
  {
    path: 'etape',
    loadComponent: () => import('../Personnels/etape/etape.component').then(c => c.EtapeComponent),
    canActivate:[AuthGuardService]
  },
  {
    path: 'critere',
    loadComponent: () => import('../Personnels/critere/critere.component').then(c => c.CritereComponent),
    canActivate:[AuthGuardService]
  },
  {
    path: 'participants',
    loadComponent: () => import('../Personnels/participant/participant.component').then(c => c.ParticipantComponent),
    canActivate:[AuthGuardService]
  },
  {
    path: 'typeActivite',
    loadComponent: () => import('../Personnels/type-acticite/type-acticite.component').then(c => c.TypeActiciteComponent),
    canActivate:[AuthGuardService]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonnelRoutingModule { }
