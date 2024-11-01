import { Component, inject, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor, MatButton, MatIconButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatBadge } from '@angular/material/badge';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';
import {Router, RouterLink} from '@angular/router';
import { NotificationListComponent } from '@app/header/_notifications/notification-list/notification-list.component';
import { AssistantSearchComponent } from '@app/header/_assistant-search/assistant-search.component';
import { EmrPopoverModule } from '@elementar/components/popover';
import { IconComponent } from '@elementar/components/icon';
import { SoundEffectDirective, ThemeManagerService } from '@elementar/components/core';
import { LayoutApiService } from '@elementar/components/layout';
import { DicebearComponent } from '@elementar/components/avatar';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    AsyncPipe,
    MatFormField,
    MatInput,
    MatPrefix,
    MatBadge,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    DicebearComponent,
    MatDivider,
    MatButton,
    MatTooltip,
    NotificationListComponent,
    EmrPopoverModule,
    RouterLink,
    AssistantSearchComponent,
    IconComponent,
    MatAnchor,
    SoundEffectDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  host: {
    'class': 'block w-full h-full'
  }
})
export class HeaderComponent {
  protected _themeManager = inject(ThemeManagerService);
  private _layoutApi = inject(LayoutApiService);

  @Input()
  sidebarHidden = false;

  toggleSidebar(): void {
    if (!this.sidebarHidden) {
      this._layoutApi.hideSidebar('root');
    } else {
      this._layoutApi.showSidebar('root');
    }

    this.sidebarHidden = !this.sidebarHidden;
  }

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = this.isBrowser() ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token'); // Supprimer le token aussi
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['auth/sign-in']);
  }

  getNom(): string | null {
    let user = this.currentUserSubject.value;
    return user ? user.prenom : null;
  }

  getPrenom(): string | null {
    let user = this.currentUserSubject.value;
    return user ? user.nom : null;
  }

  getUsername(): string | null {
    let user = this.currentUserSubject.value;
    return user ? user.username : null;
  }

}
