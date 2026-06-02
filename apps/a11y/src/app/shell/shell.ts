import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  Component,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { appRoutes, getNavRoutes } from '../app.routes';

@Component({
  selector: 'app-shell',
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav
        #drawer
        [mode]="isMobile() ? 'over' : 'side'"
        [fixedInViewport]="isMobile()"
        fixedTopGap="64"
      >
        <mat-nav-list aria-label="Main navigation">
          @for (item of navItems; track item.path) {
            <a
              mat-list-item
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeSidenavOnNavigate()"
            >
              {{ item.title }}
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar>
          @if (isMobile()) {
            <button
              mat-icon-button
              type="button"
              (click)="drawer.toggle()"
              aria-label="Toggle navigation menu"
            >
              <mat-icon>menu</mat-icon>
            </button>
          }
          <h1 class="shell-title">{{ title }}</h1>
        </mat-toolbar>

        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .shell-container {
      height: 100%;
    }

    .shell-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .content {
      padding: 1.5rem;
    }

    a.active {
      background-color: color-mix(
        in srgb,
        var(--mat-sys-primary) 12%,
        transparent
      );
    }
  `,
})
export class Shell {
  protected readonly title = 'a11y';
  protected readonly navItems = getNavRoutes();

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly drawer = viewChild.required<MatSidenav>('drawer');

  protected readonly isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  constructor() {
    effect(() => {
      const drawer = this.drawer();
      const mobile = this.isMobile();

      if (mobile) {
        drawer.close();
      } else {
        drawer.open();
      }
    });
  }

  protected closeSidenavOnNavigate(): void {
    if (this.isMobile()) {
      this.drawer().close();
    }
  }
}
