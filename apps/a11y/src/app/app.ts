import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Shell } from './components/shell/shell';

@Component({
  imports: [Shell],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<app-shell />`,
})
export class App {}
