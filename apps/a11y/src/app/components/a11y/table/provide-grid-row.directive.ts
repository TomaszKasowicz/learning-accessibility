import { Directive, inject } from '@angular/core';
import { GRID_ROW } from './grid-row.token';
import { NgGridRowRegistry } from './grid-row.registry';

/**
 * Bridges the parent `GridRow` into a CDK table cell.
 *
 * A node injector resolves tokens by walking the template *declaration* hierarchy, not the
 * rendered DOM. CDK table cells are declared inside `ng-container cdkColumnDef` and only later
 * stamped into the row's `cdkCellOutlet`, so `ngGridCell` can never reach `ngGridRow` on its own.
 */
@Directive({
  selector: '[appProvideNgGridRow]',
  providers: [
    {
      provide: GRID_ROW,
      useFactory: () => {
        const row = inject(NgGridRowRegistry).mostRecentRow;
        if (!row) {
          throw new Error('appProvideNgGridRow: no ngGridRow is being rendered.');
        }
        return row;
      },
    },
  ],
})
export class ProvideNgGridRowDirective {}
