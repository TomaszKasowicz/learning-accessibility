import { Component, ElementRef, inject } from "@angular/core";
import { Dialog, DialogModule} from '@angular/cdk/dialog';
import { DialogContentComponent, DialogContentData } from "./dialog-content.component";

@Component({
  selector: 'app-dialog',
  template: `
    <h1>Dialog</h1>

    <button (click)="openDialog()">Open Dialog</button>
  `,
  styles: `
  `,
  imports: [DialogModule],
})
export class DialogComponent {
  private readonly dialog = inject(Dialog);

  protected readonly elementRef = inject(ElementRef<HTMLElement>);

  protected openDialog() {
    const data: DialogContentData = { message: 'Hello, world!', elementRef: this.elementRef };
    const dialogRef = this.dialog.open(DialogContentComponent, {
      data,
      hasBackdrop: true,
      restoreFocus: true,
      autoFocus: true,
      disableClose: false,
    });

    dialogRef.closed.subscribe(v => {
      console.log('Dialog closed with result', v);
    })
  }
}
