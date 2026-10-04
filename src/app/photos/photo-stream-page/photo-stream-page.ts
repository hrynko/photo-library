import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { Photo } from '../photo';
import { PhotoApi } from '../photo-api';
import { FavoritesStore } from '../../favorites/favorites-store';
import { InfiniteScroll } from '../../shared/infinite-scroll';
import { PhotoGrid, PhotoGridItem } from '../../shared/photo-grid/photo-grid';

const BATCH_SIZE = 12;

@Component({
  imports: [InfiniteScroll, MatProgressSpinner, PhotoGrid],
  selector: 'app-photo-stream-page',
  styleUrl: './photo-stream-page.scss',
  templateUrl: './photo-stream-page.html',
})
export class PhotoStreamPage implements OnInit {
  private readonly photoApi = inject(PhotoApi);
  private readonly favoritesStore = inject(FavoritesStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly photos = signal<readonly Photo[]>([]);

  protected readonly isLoading = signal(false);
  protected readonly items = computed<readonly PhotoGridItem[]>(() =>
    this.photos().map((photo, index) => {
      const isFavorite = this.favoritesStore.has(photo.id);
      return {
        photo,
        disabled: isFavorite,
        label: isFavorite
          ? `Photo ${index + 1}, in favorites`
          : `Add photo ${index + 1} to favorites`,
      };
    }),
  );

  ngOnInit(): void {
    this.loadMore();
  }

  protected addToFavorites(photo: Photo): void {
    this.favoritesStore.add(photo);
  }

  protected loadMore(): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.photoApi
      .getPhotos(BATCH_SIZE)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((photos) => this.photos.update((current) => [...current, ...photos]));
  }
}
