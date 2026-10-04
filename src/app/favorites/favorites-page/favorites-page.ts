import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { FavoritesStore } from '../favorites-store';
import { Photo } from '../../photos/photo';
import { PhotoGrid, PhotoGridItem } from '../../shared/photo-grid/photo-grid';

@Component({
  imports: [MatButton, PhotoGrid, RouterLink],
  selector: 'app-favorites-page',
  styleUrl: './favorites-page.scss',
  templateUrl: './favorites-page.html',
})
export class FavoritesPage {
  private readonly favoritesStore = inject(FavoritesStore);
  private readonly router = inject(Router);

  protected readonly items = computed<readonly PhotoGridItem[]>(() =>
    this.favoritesStore
      .favorites()
      .map((photo, index) => ({ photo, label: `Open favorite photo ${index + 1}` })),
  );

  protected openPhoto(photo: Photo): void {
    void this.router.navigate(['/photos', photo.id]);
  }
}
