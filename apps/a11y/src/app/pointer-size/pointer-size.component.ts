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
  button {
    margin: 0.5rem;
  }

  .large-button {
    width: 100px;
    height: 100px;
  }
  .small-button {
    width: 1rem;
    height: 1rem;
    padding: 0;
  }

  `,
  imports: [],
})
export class PointerSizeComponent {
}
