import { Component, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatCheckbox} from '@angular/material/checkbox';
import { MatButton } from "@angular/material/button";
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatExpansionModule} from '@angular/material/expansion';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatRadioModule} from '@angular/material/radio';
import {MatSliderModule} from '@angular/material/slider';
import {MatTabsModule} from '@angular/material/tabs';
@Component({
  selector: 'app-focusable-and-interactive',
  template: `
    <h1>Focusable and Interactive</h1>
    <p>
      This component demonstrates a focusable and interactive elements with @angular/aria.
    </p>

    <h2>Button</h2>
    <button matButton (click)="onClick()">Click me {{ clickMeCliked() ? 'clicked' : 'not clicked' }}</button>

    <h2>Link</h2>
      <a matButton href="https://www.google.com">Google</a>

    <h2>Input</h2>
    <mat-form-field>
      <mat-label>Name</mat-label>
      <input matInput id="name" type="text" [formControl]="name" />
    </mat-form-field>

    <h2>Checkbox</h2>
    <mat-checkbox class="example-margin">Check me!</mat-checkbox>

    <h2>Select</h2>
    <mat-form-field>
      <mat-label>Cars</mat-label>
      <select matNativeControl [formControl]="car" required id="select-car">
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option>
        <option value="audi">Audi</option>
      </select>
    </mat-form-field>

    <h2>Slider</h2>
    <mat-slide-toggle>Slide me!</mat-slide-toggle>

    <h2>Button Toggle</h2>
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style">
      <mat-button-toggle value="bold">Bold</mat-button-toggle>
      <mat-button-toggle value="italic">Italic</mat-button-toggle>
      <mat-button-toggle value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>

  <h2>Datepicker</h2>
  <mat-form-field>
  <mat-label>Choose a date</mat-label>
  <input matInput [matDatepicker]="picker">
  <mat-hint>MM/DD/YYYY</mat-hint>
  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
</mat-form-field>

  <h2>Expansion Panel</h2>
  <mat-accordion>
  <mat-expansion-panel hideToggle>
    <mat-expansion-panel-header>
      <mat-panel-title> This is the expansion title </mat-panel-title>
      <mat-panel-description> This is a summary of the content </mat-panel-description>
    </mat-expansion-panel-header>
    <p>This is the primary content of the panel.</p>
  </mat-expansion-panel>
</mat-accordion>

<h2>Menu</h2>
<button matButton [matMenuTriggerFor]="menu">Menu</button>
<mat-menu #menu="matMenu">
  <button mat-menu-item>Item 1</button>
  <button mat-menu-item>Item 2</button>
</mat-menu>

<h2>Radio button</h2>
<mat-radio-group aria-label="Select an option">
  <mat-radio-button value="1">Option 1</mat-radio-button>
  <mat-radio-button value="2">Option 2</mat-radio-button>
</mat-radio-group>

  <h2>Slider</h2>
  <mat-slider>
  <input matSliderThumb aria-label="Slider">
</mat-slider>

<h2>Tabs</h2>
<mat-tab-group>
  <mat-tab label="First"> Content 1 </mat-tab>
  <mat-tab label="Second"> Content 2 </mat-tab>
  <mat-tab label="Third"> Content 3 </mat-tab>
</mat-tab-group>

  `,
  styles: `
  `,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggle,
    MatCheckbox, MatMenuModule, MatRadioModule,
    MatButton, MatDatepickerModule,MatExpansionModule,
    ReactiveFormsModule, MatButtonToggleModule, MatSliderModule, MatTabsModule],
})
export class FocusableAndInteractiveComponent {
  protected clickMeCliked = signal(false);
  protected name = new FormControl('', [Validators.required]);
  protected isChecked = new FormControl(false);
  protected car = new FormControl('');

  readonly popupExpanded = signal(false);

  protected onClick() {
    this.clickMeCliked.set(true);
    console.log('Button clicked');
  }
}
