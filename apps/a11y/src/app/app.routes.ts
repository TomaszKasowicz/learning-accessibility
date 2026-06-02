import { Route } from '@angular/router';
import { Home } from './home/home';

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
  { path: '**', redirectTo: 'home' },
];
