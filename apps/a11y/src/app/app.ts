import { Component } from '@angular/core';
import { Shell } from './shell/shell';

@Component({
  imports: [Shell],
  selector: 'app-root',
  template: `<app-shell />`,
})
export class App {}
