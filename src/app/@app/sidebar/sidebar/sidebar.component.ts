import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { Location } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { EmrNavigationModule, NavigationItem } from '@elementar/components/navigation';
import { OrderByPipe } from '@elementar/components/core';
import { DicebearComponent } from '@elementar/components/avatar';
import { MatIconButton } from '@angular/material/button';
import {
  SidebarBodyComponent,
  SidebarCompactViewModeDirective,
  SidebarComponent as EmrSidebarComponent,
  SidebarFooterComponent, SidebarHeaderComponent, SidebarNavComponent
} from '@elementar/components/sidebar';
import { ToolbarComponent } from '@demo/app/sidebar/_toolbar/toolbar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    EmrNavigationModule,
    MatRipple,
    ToolbarComponent,
    OrderByPipe,
    DicebearComponent,
    MatIconButton,
    SidebarBodyComponent,
    SidebarCompactViewModeDirective,
    EmrSidebarComponent,
    SidebarFooterComponent,
    SidebarHeaderComponent,
    SidebarNavComponent,
    ToolbarComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: {
    'class': 'sidebar'
  }
})
export class SidebarComponent implements OnInit {
  router = inject(Router);
  location = inject(Location);
  height: string | null = '200px';
  compact = false;

  @ViewChild('navigation', { static: true })
  navigation!: any;

  navItems: NavigationItem[] = [
    {
      key: 'dashboard',
      type: 'link',
      name: 'Dashboard',
      icon: 'home',
      link: '/'
    },
    {
      key: 'entite-odc',
      type: 'link',
      name: 'EntiteODC',
      icon: 'corporation',
      link: 'admin/entite-odc'
    },
    {
      key: 'employer',
      type: 'link',
      name: 'Employer',
      icon: 'person',
      link: 'admin/employer'
    },
    {
      key: 'role',
      type: 'link',
      name: 'Role',
      icon: 'settings',
      link: 'admin/role'
    },

    {
      key: 'activity',
      type: 'link',
      name: 'Activite',
      icon: 'activity',
      link: 'personnel/activity'
    },
    {
      key: 'typeActivite',
      type: 'link',
      name: 'Type-Activite',
      icon: 'types',
      link: 'personnel/typeActivite'
    },
    {
      key: 'critere',
      type: 'link',
      name: 'Critere',
      icon: 'check',
      link: 'personnel/critere'
    },
    {
      key: 'etape',
      type: 'link',
      name: 'Etape',
      icon: 'steps',
      link: 'personnel/etape' // Remplacez '1' par l'ID que vous souhaitez passer
    },
    {
      key: 'participants',
      type: 'link',
      name: 'Participant',
      icon: 'group',
      link: 'personnel/participants'
    },
  ];
  navItemLinks: NavigationItem[] = [];
  activeKey: any = 'home';

  ngOnInit() {
    this.navItems.forEach(navItem => {
      this.navItemLinks.push(navItem);

      if (navItem.children) {
        this.navItemLinks = this.navItemLinks.concat(navItem.children as NavigationItem[]);
      }
    });
    this._activateLink();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._activateLink();
      })
    ;
  }

  private _activateLink() {
    const activeLink = this.navItemLinks.find(
      navItem =>
        navItem.link === this.location.path() ||
        navItem.link === 'dashboard' && this.location.path() === ''
    );

    if (activeLink) {
      this.activeKey = activeLink.key;
    } else {
      this.activeKey = null;
    }
  }
}
