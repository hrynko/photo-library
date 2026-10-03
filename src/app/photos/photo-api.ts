import { Service } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';

import { Photo } from './photo';

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;

function randomDelay(): number {
  return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
}

@Service()
export class PhotoApi {
  getPhotos(count: number): Observable<Photo[]> {
    return defer(() => {
      const photos = Array.from({ length: count }, () => ({ id: crypto.randomUUID() }));
      return of(photos).pipe(delay(randomDelay()));
    });
  }
}
