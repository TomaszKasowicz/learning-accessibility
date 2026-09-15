import { Component } from "@angular/core";

@Component({
  selector: 'app-wrong-headings',
  template: `
        <h1>Heading Level 1</h1>
        <h2>Heading Level 2</h2>
       <!-- <h3>Heading Level 3</h3> -->
        <p>Heading Level 3 is missing</p>
        <h4>Heading Level 4</h4>
        <h5>Heading Level 5</h5>
        <h6>Heading Level 6</h6>
  `,
})
export class WrongHeadings {}
