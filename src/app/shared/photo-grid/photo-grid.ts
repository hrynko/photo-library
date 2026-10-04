import { Component, input, output } from '@angular/core';

import { PhotoGridTile } from './photo-grid-tile';
import { Photo } from '../../photos/photo';

export interface PhotoGridItem {
  readonly photo: Photo;
  readonly label: string;
  readonly disabled?: boolean;
}

@Component({
  imports: [PhotoGridTile],
  selector: 'app-photo-grid',
  styleUrl: './photo-grid.scss',
  templateUrl: './photo-grid.html',
})
export class PhotoGrid {
  readonly items = input.required<readonly PhotoGridItem[]>();
  readonly photoSelected = output<Photo>();
}
