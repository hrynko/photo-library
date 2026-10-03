import { Service, computed, inject, signal } from '@angular/core';

import { Photo } from '../photos/photo';
import { STORAGE } from '../shared/storage';

const STORAGE_KEY = 'photo-library.favorites';

@Service()
export class FavoritesStore {
  private readonly storage = inject(STORAGE);
  private readonly state = signal<readonly Photo[]>(this.restore());

  readonly favorites = this.state.asReadonly();
  readonly ids = computed<ReadonlySet<string>>(
    () => new Set(this.favorites().map((photo) => photo.id)),
  );

  has(id: string): boolean {
    return this.ids().has(id);
  }

  add(photo: Photo): void {
    if (!this.has(photo.id)) {
      this.save([...this.state(), photo]);
    }
  }

  remove(id: string): void {
    this.save(this.state().filter((photo) => photo.id !== id));
  }

  private save(favorites: readonly Photo[]): void {
    this.state.set(favorites);
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(favorites.map((photo) => photo.id)));
    } catch {
      // ignore storage errors
    }
  }

  private restore(): Photo[] {
    try {
      const value: unknown = JSON.parse(this.storage?.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(value)) {
        return [];
      }
      const ids = value.filter((id): id is string => typeof id === 'string' && id.length > 0);
      return [...new Set(ids)].map((id) => ({ id }));
    } catch {
      return [];
    }
  }
}
