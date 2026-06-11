import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs';
import { AxeViolations } from '../../axe/axe-violations';
import { AxeService } from '../../axe/axe.service';
import { getNavRoutes } from '../../app.routes';

@Component({
  selector: 'app-shell',
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    AxeViolations,
  ],
  template: `
    <a class="skip-link" href="javascript:void(0)" (click)="skipToContent(mainContent)">
      Skip to content
    </a>

    <mat-sidenav-container class="shell-container">
      <mat-sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="drawerOpen()"
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
              (click)="toggleDrawer()"
              aria-label="Toggle navigation menu"
            >
              <mat-icon>menu</mat-icon>
            </button>
          }
          <header class="shell-title">{{ title }}</header>
          <span class="toolbar-spacer"></span>
          <button
            mat-stroked-button
            type="button"
            [disabled]="axe.running()"
            (click)="runAxeTest()"
          >
            @if (axe.running()) {
              <mat-spinner diameter="18" />
            } @else {
              Run Axe test
            }
          </button>
        </mat-toolbar>

        <main id="main-content" class="content" #mainContent tabindex="-1">
          <div class="route-content" #routeContent>
            <router-outlet />
          </div>
          <app-axe-violations />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      padding: 8px;
      z-index: 1000;
      transition: top 0.3s;
    }

    .skip-link:focus {
      top: 0;
    }

    .shell-container {
      height: 100%;
    }

    .shell-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 1.5rem;
    }

    .content:focus {
      outline: none;
    }

    .route-content {
      display: block;
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
  protected readonly axe = inject(AxeService);

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly routeContent = viewChild.required<ElementRef<HTMLElement>>('routeContent');
  protected readonly drawerOpen = signal(false);

  protected readonly isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  constructor() {
    effect(() => {
      this.drawerOpen.set(!this.isMobile());
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.axe.clear());
  }

  protected async runAxeTest(): Promise<void> {
    await this.axe.run(this.routeContent().nativeElement);
  }

  protected toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  protected closeSidenavOnNavigate(): void {
    if (this.isMobile()) {
      this.drawerOpen.set(false);
    }
  }

  protected skipToContent(mainContent: HTMLElement): void {
    mainContent.focus();
  }
}
