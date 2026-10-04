import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { PhotoDetailPage } from './photo-detail-page';
import { FavoritesStore } from '../favorites-store';
import { STORAGE } from '../../shared/storage';

@Component({ template: '' })
class Page {}

describe('PhotoDetailPage', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'favorites', component: Page },
            { path: 'photos/:id', component: PhotoDetailPage },
          ],
          withComponentInputBinding(),
        ),
        {
          provide: STORAGE,
          useValue: { getItem: () => JSON.stringify(['a', 'b']), setItem: () => undefined },
        },
      ],
    });
    harness = await RouterTestingHarness.create('/photos/b');
  });

  it('renders the photo from the route', () => {
    const image = harness.routeNativeElement?.querySelector('img');

    expect(image?.src).toBe('https://picsum.photos/seed/b/1600/1200');
    expect(image?.alt).toBeTruthy();
  });

  it('removes the photo from favorites and returns to the favorites page', async () => {
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);
    const button = await loader.getHarness(
      MatButtonHarness.with({ text: 'Remove from favorites' }),
    );

    await button.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).favorites()).toEqual([{ id: 'a' }]);
    expect(TestBed.inject(Router).url).toBe('/favorites');
  });
});
