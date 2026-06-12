import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, ElementRef, inject } from "@angular/core";
import { AxeService } from "../../../axe/axe.service";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatButtonModule } from "@angular/material/button";

export type DialogContentData = {
  message: string;
  elementRef: ElementRef<HTMLElement>;
};

@Component({
  selector: 'app-dialog-content',
  template: `
    <h1>Dialog Content</h1>
    <p>
      Data from Host: {{ data.message }}
    </p>
    <div>
      <div>
        <button mat-button (click)="dialogRef.close('OK')">OK</button>

        <button mat-button (click)="dialogRef.close()">Cancel</button>

        <button mat-button aria-label="Foo">Label Violation</button>
      </div>
      <div>
      <button
        mat-button
        type="button"
        [disabled]="axe.running()"
        (click)="runAxeTest(data.elementRef.nativeElement)"
        class="host-axe"
      >
      <!-- Mat Spinner was causing AXE Violation when running Axe on Self but only for the 1st time -->
        Run Axe test on Host
      </button>

        <button
          mat-button
          type="button"
          [disabled]="axe.running()"
          (click)="runAxeTest(elementRef.nativeElement)"
          class="self-axe"
        >
            Run Axe test on Self
        </button>
        <button
          mat-button
          type="button"
          [disabled]="axe.running()"
          (click)="runAxeTest()"
          class="self-axe"
        >
            Run Axe test full page
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: #fff;
      padding: 1.5rem;
    }
  `,
  imports: [MatButtonModule],
})
export class DialogContentComponent {
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  data = inject<DialogContentData>(DIALOG_DATA);
  protected readonly axe = inject(AxeService);
  protected readonly elementRef = inject(ElementRef<HTMLElement>);

  protected async runAxeTest(nativeElement?: HTMLElement): Promise<void> {
    console.log('Running axe test on element', nativeElement);
    await this.axe.run(nativeElement);
  }
}
