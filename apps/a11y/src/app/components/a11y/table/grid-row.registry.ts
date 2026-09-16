import { Injectable } from '@angular/core';
import { GridRow } from '@angular/aria/grid';

/**
 * Hands the row being rendered to the cells that belong to it.
 *
 * `CdkTable._renderRow` creates a row view and then immediately stamps that row's cell views, so
 * the most recently created row always owns the cells under construction. `CdkCellOutlet` relies
 * on the same handoff through its `mostRecentCellOutlet` static.
 */
@Injectable()
export class NgGridRowRegistry {
  mostRecentRow: GridRow | null = null;
}
