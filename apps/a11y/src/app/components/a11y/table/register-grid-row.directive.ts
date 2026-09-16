import { Directive, inject } from '@angular/core';
import { GridRow } from '@angular/aria/grid';
import { NgGridRowRegistry } from './grid-row.registry';

/** Publishes this row's `GridRow` so the cells stamped into it can pick it up. */
@Directive({
  selector: '[appRegisterNgGridRow]',
})
export class RegisterNgGridRowDirective {
  constructor() {
    // Publishing has to happen here rather than in ngOnInit: CdkTable constructs the cells during
    // the same creation pass, before any lifecycle hook on this row has run.
    inject(NgGridRowRegistry).mostRecentRow = inject(GridRow);
  }
}
