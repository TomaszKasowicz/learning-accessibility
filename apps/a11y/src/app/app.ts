import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';

@Component({
  imports: [NxWelcome, RouterModule],
  selector: 'app-root',
  template: `<app-nx-welcome></app-nx-welcome> <router-outlet></router-outlet>`,
  styles: ``,
})
export class App {
  protected title = 'a11y';
}
