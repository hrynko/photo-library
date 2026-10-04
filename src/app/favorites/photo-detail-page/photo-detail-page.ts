import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';

import { FavoritesStore } from '../favorites-store';
import { detailUrl } from '../../photos/photo';

@Component({
  imports: [MatButton, NgOptimizedImage],
  selector: 'app-photo-detail-page',
  styleUrl: './photo-detail-page.scss',
  templateUrl: './photo-detail-page.html',
})
export class PhotoDetailPage {
  readonly id = input.required<string>();

  private readonly favoritesStore = inject(FavoritesStore);
  private readonly router = inject(Router);

  protected readonly src = computed(() => detailUrl({ id: this.id() }));

  protected removeFromFavorites(): void {
    this.favoritesStore.remove(this.id());
    void this.router.navigate(['/favorites']);
  }
}
