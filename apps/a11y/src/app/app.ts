import { Component } from '@angular/core';
import { Shell } from './components/shell/shell';

@Component({
  imports: [Shell],
  selector: 'app-root',
  template: `<app-shell />`,
})
export class App {}
