import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { FavoritesStore } from './favorites-store';

export const favoriteGuard: CanActivateFn = (route) => {
  const favoritesStore = inject(FavoritesStore);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (id !== null && favoritesStore.has(id)) {
    return true;
  }

  return router.createUrlTree(['/favorites']);
};
