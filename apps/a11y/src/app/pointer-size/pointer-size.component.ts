import { Component } from "@angular/core";

@Component({
  selector: 'app-pointer-size',
  template: `
    <h1>Pointer Size</h1>
    <button>Normal Button</button>
    <button class="large-button">Large Button</button>
    <button class="small-button">Small Button</button>
  `,
  styles: `
  .large-button {
    width: 100px;
    height: 100px;
  }
  .small-button {
    width: 10px;
    height: 10px;
  }

  `,
  imports: [],
})
export class PointerSizeComponent {
}
