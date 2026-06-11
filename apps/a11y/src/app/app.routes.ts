import { Route } from '@angular/router';
import { Home } from './home/home';
import { Headings } from './headings/headings';
import { WrongHeadings } from './wrong-headings/wrong-headings';
import { ForbiddenChildrenComponent } from './forbidden-children/forbidden-children.component';
import { PointerSizeComponent } from './pointer-size/pointer-size.component';
import { FocusObscuredComponent } from './focus-obscured/focus-obscured.component';
import { AxeRulesComponent } from './axe-rules/axe-rules.component';

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
  { path: 'axe-rules', component: AxeRulesComponent, title: 'Axe Rules' },
  { path: '**', redirectTo: 'home' },
];
