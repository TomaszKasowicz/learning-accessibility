import { Route } from '@angular/router';
import { Home } from './home/home';
import { Headings } from './headings/headings';
import { WrongHeadings } from './wrong-headings/wrong-headings';

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
  { path: '**', redirectTo: 'home' },
];
