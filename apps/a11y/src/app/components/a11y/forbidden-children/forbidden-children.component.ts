
import { Component, signal } from '@angular/core';
import {Tab as AriaTab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

type TabId = 'ok-tab-1' | 'ok-tab-2' | 'ok-tab-3';

interface Tab {
  id: TabId;
  panelId: string;
  label: string;
}

@Component({
  selector: 'app-forbidden-children',
  template: `
    <h1>Forbidden Children</h1>

    <h2>OK example</h2>

    <div ngTabs>
      <div ngTabList selectionMode="explicit" [selectedTab]="selectedTab()">
        @for (tab of tabs; track tab.id) {
          <button ngTab [value]="tab.id">
            {{ tab.label }}
          </button>
        }
      </div>

      <div>
        @for (tab of tabs; track tab.id) {
          <div ngTabPanel [value]="tab.id">
            <ng-template ngTabContent>
              <h2>{{ tab.label }}</h2>
            </ng-template>
          </div>
        }
      </div>
    </div>


    <hr />
    <h2>NOT OK example</h2>
    <div #wrongTablist role="tablist" id="not-ok-parent-tablist">
      - I am a div element with role="tablist"
      <div role="tablist" id="not-ok-child-tablist">
        <p>- And I am another div element with role="tablist" within the one above : not allowed!</p>

        <button role="tab" aria-controls="not-ok-tab-1">Not OK - Tab 1</button>
      </div>
      <div role="tabpanel" id="not-ok-tab-1" aria-labelledby="not-ok-tab-1">
        <h2>Not OK - Tab 1 Content</h2>
      </div>
    </div>
    <code>
      <pre>{{ formatHtml(wrongTablist.outerHTML) }}</pre>
    </code>
  `,
  styles: `
    pre {
      background: #141414;
      color: #e0e0e0;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }
  `,
  imports: [AriaTab, Tabs, TabList, TabPanel, TabContent],
})
export class ForbiddenChildrenComponent {
  protected readonly tabs: Tab[] = [
    { id: 'ok-tab-1', panelId: 'ok-panel-1', label: 'Tab 1' },
    { id: 'ok-tab-2', panelId: 'ok-panel-2', label: 'Tab 2' },
    { id: 'ok-tab-3', panelId: 'ok-panel-3', label: 'Tab 3' },
  ];

  protected readonly selectedTab = signal<TabId>('ok-tab-1');

  protected formatHtml(html: string): string {
    if (!html) return '';

     // 1. Optional: Clean up Angular's internal tracking attributes
    let cleanHtml = html
      .replace(/\s_ngcontent-[^>=\s]+/g, '')
      .replace(/\sng-reflect-[^>=\s]+="[^"]*"/g, '');

    // 2. Simple HTML Pretty-Print Logic
    let formatted = '';
    // Add new lines before opening tags and after closing tags
    cleanHtml = cleanHtml
      // New line before every opening tag, unless at the start
      .replace(/(?!^)(<[^/!][^>]*>)/g, '\r\n$1')
      // New line after every closing tag
      .replace(/(<\/[^>]+>)/g, '$1\r\n');
    let pad = 0;

    cleanHtml.split('\r\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0; // Single line element like <p>Text</p>
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) pad -= 1; // Closing tag
      } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
        indent = 1; // Opening tag
      }

      // Use '  ' (two spaces) or '\t' for tabs
      const padding = '  '.repeat(pad);
      formatted += padding + node + '\n';
      pad += indent;
    });

    return formatted.trim();
  }
}
