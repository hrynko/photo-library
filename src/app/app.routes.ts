import { Routes } from '@angular/router';

import { favoriteGuard } from './favorites/favorite-guard';

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
  {
    path: 'photos/:id',
    title: 'Photo',
    canActivate: [favoriteGuard],
    loadComponent: () =>
      import('./favorites/photo-detail-page/photo-detail-page').then((m) => m.PhotoDetailPage),
  },
  { path: '**', redirectTo: '' },
];
