import { Component } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { Grid, GridRow, GridCell, GridCellWidget } from '@angular/aria/grid';

import { ProvideNgGridRowDirective } from './provide-grid-row.directive';
import { RegisterNgGridRowDirective } from './register-grid-row.directive';
import { NgGridRowRegistry } from './grid-row.registry';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';

type Person = {
  id: number;
  name: string;
  age: number;
};

@Component({
  selector: 'app-table-with-angular-aria',
  template: `
    <h1>Table with Angular Aria</h1>

    <!-- role has to be declared here: CdkTable forces role="table" unless the template sets one. -->
    <div class="block w-full mb-4">
      <!--
       enableSelection is enabled so the grid manages roving tabindex/selection navigation.
       selectionMode="follow" is required so Space/Enter can still toggle checkbox widgets.
    -->
      <table
        ngGrid
        role="grid"
        class="border-collapse w-full"
        cdk-table
        [dataSource]="data"
        [enableSelection]="true"
        [multi]="true"
        [selectionMode]="'follow'"
      >
        <caption>
          CDK Table with Angular Aria
        </caption>

        <ng-container cdkColumnDef="selection">
          <th
            cdk-header-cell
            *cdkHeaderCellDef
            appProvideNgGridRow
            ngGridCell
            role="columnheader"
            class="text-left"
          >
            <mat-checkbox
              ngGridCellWidget
              [focusTarget]="resolveWidgetInput"
              [tabIndex]="-1"
              (change)="toggleAll($event)"
              [checked]="allSelected()"
              [indeterminate]="partiallySelected()"
              ariaLabel="Select All"
            >
              mat-checkbox for all
            </mat-checkbox>
          </th>
          <td cdk-cell *cdkCellDef="let row" appProvideNgGridRow ngGridCell>
            <input
              ngGridCellWidget
              type="checkbox"
              [checked]="selection.isSelected(row)"
              (change)="selectRow(row)"
              [id]="'cdk-checkbox-' + row.id"
            />
            <label [attr.for]="'cdk-checkbox-' + row.id"
              >Native Checkbox {{ row.id }}</label
            >
            <!-- <mat-checkbox ngGridCellWidget [checked]="selection.isSelected(row)" (change)="selectRow(row)"/> -->
          </td>
        </ng-container>

        <ng-container cdkColumnDef="name">
          <th
            cdk-header-cell
            *cdkHeaderCellDef
            appProvideNgGridRow
            ngGridCell
            role="columnheader"
          >
            Name
          </th>
          <td cdk-cell *cdkCellDef="let row" appProvideNgGridRow ngGridCell>
            {{ row.name }}
          </td>
        </ng-container>

        <ng-container cdkColumnDef="age">
          <th
            cdk-header-cell
            *cdkHeaderCellDef
            appProvideNgGridRow
            ngGridCell
            role="columnheader"
          >
            Age
          </th>
          <td cdk-cell *cdkCellDef="let row" appProvideNgGridRow ngGridCell>
            {{ row.age }}
          </td>
        </ng-container>

        <tr
          ngGridRow
          appRegisterNgGridRow
          cdk-header-row
          *cdkHeaderRowDef="displayedColumns"
        ></tr>
        <tr
          ngGridRow
          appRegisterNgGridRow
          cdk-row
          *cdkRowDef="let row; columns: displayedColumns"
        ></tr>
      </table>
    </div>

    <div class="block w-full">
      <table
        ngGrid
        class="w-full border-collapse"
        [enableSelection]="true"
        [multi]="true"
        [selectionMode]="'follow'"
      >
        <caption>
          Native Table with Angular Aria
        </caption>
        <thead>
          <tr ngGridRow>
            <th ngGridCell>
              <input
                ngGridCellWidget
                type="checkbox"
                [checked]="allSelected()"
                (change)="toggleAllNative($event)"
                [indeterminate]="partiallySelected()"
                id="native-checkbox-all"
              />
              <label for="native-checkbox-all">Native Checkbox For All</label>
            </th>
            <th ngGridCell>Name</th>
            <th ngGridCell>Age</th>
          </tr>
        </thead>
        <tbody>
          @for (row of data; track row.id) {
            <tr ngGridRow>
              <!--
                mat-checkbox needs focusTarget: the grid focuses the ngGridCellWidget host, but
                <mat-checkbox> is only a wrapper -- keys reach the inner input. tabIndex="-1"
                pulls that inner input out of the tab order so the grid keeps the roving tabindex.
              -->
              <td ngGridCell>
                <mat-checkbox
                  ngGridCellWidget
                  [focusTarget]="resolveWidgetInput"
                  [tabIndex]="-1"
                  [checked]="selection.isSelected(row)"
                  (change)="selectRow(row)"
                  >mat-checkbox for row {{ row.id }}</mat-checkbox
                >
              </td>
              <td ngGridCell>{{ row.name }}</td>
              <td ngGridCell>{{ row.age }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3">No data</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="block w-full">
      <h1>Notes</h1>
      <ul>
        <li>
          We cannot use <code>@angular/aria</code> with CDK table OOTB. We need
          hacking to make it work. (see code for more details)
        </li>
        <li>
          If selectionMode is set to <code>'explicit'</code> then
          <code>ngGridCellWidget</code> will not work (i.e hitting space on
          checkbox will not toggle it).
        </li>
        <li>
          If selectionMode is set to <code>'follow'</code> then
          <code>ngGridCellWidget</code> will work (i.e hitting space on checkbox
          will toggle it).
        </li>
        <li>
          To make <code>ngGridCellWidget</code> work with mat-checkbox, we need
          to set <code>[focusTarget]</code> input for <code>mat-checkbox</code>.
        </li>
      </ul>
    </div>
  `,
  imports: [
    MatCheckboxModule,
    CdkTableModule,
    Grid,
    GridRow,
    GridCell,
    ProvideNgGridRowDirective,
    RegisterNgGridRowDirective,
    GridCellWidget,
  ],
  providers: [NgGridRowRegistry],
  styles: `
    table,
    thead,
    tbody,
    tr,
    th,
    td {
      padding: 0.5rem;
      border: 1px solid black;
    }
  `,
})
export class TableWithAngularAriaComponent {
  selection = new SelectionModel<Person>(true, []);

  data: Person[] = [
    { id: 1, name: 'John Doe', age: 25 },
    { id: 2, name: 'Jane Doe', age: 30 },
    { id: 3, name: 'Jim Doe', age: 35 },
  ];

  displayedColumns: string[] = ['selection', 'name', 'age'];

  /** Stable reference: a new arrow per change detection would keep rewriting the signal input. */
  resolveWidgetInput = (host: HTMLElement) =>
    host.querySelector('input') ?? undefined;

  partiallySelected() {
    return (
      this.selection.selected.length > 0 &&
      this.selection.selected.length < this.data.length
    );
  }

  allSelected() {
    return this.selection.selected.length === this.data.length;
  }

  toggleAll(event: MatCheckboxChange) {
    const indeterminate = event.source.indeterminate;
    if (indeterminate) {
      this.selection.clear();
      event.source.checked = false;
      return;
    }

    if (event.checked) {
      this.selection.setSelection(...this.data);
    } else {
      this.selection.clear();
    }
  }

  toggleAllNative(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selection.setSelection(...this.data);
    } else {
      this.selection.clear();
    }
  }

  selectRow(row: Person) {
    this.selection.toggle(row);
  }
}
