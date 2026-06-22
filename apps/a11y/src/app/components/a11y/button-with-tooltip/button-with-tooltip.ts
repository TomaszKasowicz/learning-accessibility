import { Component, signal } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { FormControl, FormControlDirective, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-button-with-tooltip',
  template: `
    <h1>Button with Tooltip</h1>
    <mat-form-field>
      <mat-label for="number">Hide Delay</mat-label>
      <input matInput id="number" type="number" [formControl]="hideDelay">
    </mat-form-field>
    <div>
      <button
        matButton
        (click)="buttonClicked('Enabled')"
        [matTooltip]="enabledTooltip" [matTooltipHideDelay]="hideDelay.value">Enabled button</button>
      <button
      matButton
      #disabledButton
      disabled disabledInteractive
      (click)="!disabledButton.disabled && buttonClicked('Disabled')"
      [matTooltip]="disabledTooltip" [matTooltipHideDelay]="hideDelay.value">Disabled button</button>
    </div>
    <h2>
      Clicked: {{ clicked() }}
    </h2>
  `,
  styles: `
  `,
  imports: [MatButton, MatTooltip, MatInput, MatFormField, MatLabel, ReactiveFormsModule],
})
export class ButtonWithTooltipComponent {
  protected readonly enabledTooltip = 'This is a tooltip';
  protected readonly disabledTooltip = 'This is a disabled tooltip';
  hideDelay = new FormControl(1000);

  clicked = signal('None')
  protected buttonClicked(button: 'Enabled' | 'Disabled') {
    this.clicked.set(button);
  }
}
