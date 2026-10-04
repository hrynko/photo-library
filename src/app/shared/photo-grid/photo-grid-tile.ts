import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatRipple } from '@angular/material/core';

import { Photo, THUMBNAIL_SIZE, thumbnailUrl } from '../../photos/photo';

@Component({
  imports: [MatRipple, NgOptimizedImage],
  selector: 'app-photo-grid-tile',
  styleUrl: './photo-grid-tile.scss',
  templateUrl: './photo-grid-tile.html',
})
export class PhotoGridTile {
  readonly photo = input.required<Photo>();
  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly selected = output();

  protected readonly size = THUMBNAIL_SIZE;
  protected readonly src = computed(() => thumbnailUrl(this.photo()));

  protected select(): void {
    if (!this.disabled()) {
      this.selected.emit();
    }
  }
}
