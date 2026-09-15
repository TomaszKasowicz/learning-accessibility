import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
  <h1>A simple application to demonstrate accessibility issues and best practices.</h1>
  <section id="info">
    <h2>Info</h2>

    <ul>
      <li>Click on any of the links below to navigate to the corresponding page.</li>
      <li>Then click on the "Run Axe test" button to run the Axe test on the current page.</li>
      <li>The Axe test will run and report any accessibility violations found.</li>
      <li>The violations will be listed in the "Axe results" section below.</li>
      <li>There are also 2 Links which display Axe Rules.</li>
    </ul>
   </section>

   <section id="notes">
    <h2>NOTES:</h2>
    <ul>
      <li>By default, Axe Runs all the rules except <code>wcag22aa, experimental, best-practice, deprecated</code></li>
      <li>To enable additional tags (i.e <code>wcag22aa</code>), you need to add <strong>ALL</strong> of them (the new one and the default ones) to the <code>runOnly</code> object.</li>
      <li>Same goes for AxeBuilder in Playwright.</li>
      <li>
        If the rule is tagged with <code>experimental</code>, tag. You need to either
        <ul>
          <li>Add the <code>experimental</code> tag to the <code>runOnly</code> object.</li>
          <li>Enable the rule by adding <code>rules: &#123; &#39;rule-id&#39;: &#123; enabled: true &#125; &#125;</code> to the AxeBuilder options.</li>
        </ul>
        Even if the rule has different tags (ex. <code>wcag22aa</code> and <code>experimental</code>), You still need to enable <code>experimental</code> to run it.
        This is because of how AXE works. If the rule is enabled by default or a different tag, it will not run if it is also experimental.
      </li>

      <li>There are also 2 Links which display Axe Rules.
        <ul>
          <li>The first link displays AXE Rules by Tag List.</li>
          <li>The second link displays the same AXE Rules groupped by tags.</li>
        </ul>
      </li>
    </ul>

    <aside>
      <p>This page does pass AXE Core test.</p>
    </aside>
  </section>`,

})
export class Home {}
