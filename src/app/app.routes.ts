import { Routes } from '@angular/router';
import {AuthGuardService} from "./service/auth/guard/auth-guard.service";

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'error',
    loadChildren: () => import('./error/error.module').then(m => m.ErrorModule)
  },
  {
    path: '',
    loadComponent: () => import('./common/common.component').then(c => c.CommonComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./main/main.component').then(c => c.MainComponent),
        canActivate:[AuthGuardService]
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate:[AuthGuardService]
      },
      {
        path: 'personnel',
        loadChildren: () => import('./Personnels/personnel.module').then(m => m.PersonnelModule),
        canActivate:[AuthGuardService]
      },
      {
        path: '',
        loadComponent: () => import('./admin/role/role.component').then(c => c.RoleComponent),
      }
    ]
  },
  {
    path: '**',
    title: 'Page Not Found',
    loadComponent: () => import('./error/not-found/not-found.component').then(c => c.NotFoundComponent)
  },

];
