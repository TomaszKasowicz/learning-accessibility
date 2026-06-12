import { Route } from '@angular/router';
import { Home } from './components/home/home';
import { Headings } from './components/a11y/headings/headings';
import { WrongHeadings } from './components/a11y/wrong-headings/wrong-headings';
import { ForbiddenChildrenComponent } from './components/a11y/forbidden-children/forbidden-children.component';
import { PointerSizeComponent } from './components/a11y/pointer-size/pointer-size.component';
import { FocusObscuredComponent } from './components/a11y/focus-obscured/focus-obscured.component';
import { ColorContrastComponent } from './components/a11y/color-contrast/color-contrast.component';
import { TabindexNonInteractiveComponent } from './components/a11y/tabindex-non-interactive/tabindex-non-interactive.component';
import { AxeRulesByTagComponent } from './components/axe-rules/axe-rules-by-tag.component';
import { AxeRulesComponent } from './components/axe-rules/axe-rules.component';
import { DialogComponent } from './components/a11y/dialog/dialog.component';
import { DuplicateMainComponent } from './components/a11y/duplicate-main/duplicate-main.component';
import { LabelContentNameMismatchComponent } from './components/a11y/label-content-name-mismatch/label-content-name-mismatch.component';
import { ExceedViewportComponent } from './components/a11y/exceed-viewport/exceed-viewport.component';

export interface NavRoute {
  path: string;
  title: string;
}

export function getNavRoutes(): NavRoute[] {
  return appRoutes.flatMap((route) => {
    if (!route.path || route.path === '**' || route.redirectTo || !route.title) {
      return [];
    }

    const title = typeof route.title === 'string' ? route.title : route.path;

    return [{ path: route.path, title }];
  });
}

export const appRoutes: Route[] = [
  { path: 'home', component: Home, title: 'Home' },
  { path: 'headings', component: Headings, title: 'Headings' },
  { path: 'wrong-headings', component: WrongHeadings, title: 'Wrong Headings' },
  { path: 'forbidden-children', component: ForbiddenChildrenComponent, title: 'Forbidden Children' },
  { path: 'pointer-size', component: PointerSizeComponent, title: 'Pointer Size'},
  { path: 'focus-obscured', component: FocusObscuredComponent, title: 'Focus Obscured' },
  { path: 'color-contrast', component: ColorContrastComponent, title: 'Color Contrast' },
  {
    path: 'tabindex-non-interactive',
    component: TabindexNonInteractiveComponent,
    title: 'Tabindex on Static Content',
  },
  { path: 'dialog', component: DialogComponent, title: 'Dialog' },
  {
    path: 'duplicate-main',
    component: DuplicateMainComponent,
    title: 'Duplicate Main',
  },
  {
    path: 'label-content-name-mismatch',
    component: LabelContentNameMismatchComponent,
    title: 'Label Content Name Mismatch',
  },
  {
    path: 'exceed-viewport',
    component: ExceedViewportComponent,
    title: 'Exceed Viewport',
  },
  { path: 'axe-rules', component: AxeRulesComponent, title: 'Axe Rules' },
  {
    path: 'axe-rules-by-tag',
    component: AxeRulesByTagComponent,
    title: 'Axe Rules by Tag',
  },
  { path: '**', redirectTo: 'home' },
];
