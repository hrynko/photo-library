import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Photos',
    loadComponent: () =>
      import('./photos/photo-stream-page/photo-stream-page').then((m) => m.PhotoStreamPage),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    loadComponent: () =>
      import('./favorites/favorites-page/favorites-page').then((m) => m.FavoritesPage),
  },
  { path: '**', redirectTo: '' },
];
