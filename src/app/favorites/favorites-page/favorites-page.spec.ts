import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { FavoritesPage } from './favorites-page';
import { STORAGE } from '../../shared/storage';

@Component({ template: '' })
class Page {}

describe('FavoritesPage', () => {
  let storedIds: string[];
  let harness: RouterTestingHarness;

  beforeEach(() => {
    storedIds = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Page },
          { path: 'favorites', component: FavoritesPage },
          { path: 'photos/:id', component: Page },
        ]),
        {
          provide: STORAGE,
          useValue: { getItem: () => JSON.stringify(storedIds), setItem: () => undefined },
        },
      ],
    });
  });

  async function render(): Promise<HTMLElement> {
    harness = await RouterTestingHarness.create('/favorites');
    return harness.routeNativeElement as HTMLElement;
  }

  function tiles(element: HTMLElement): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll('app-photo-grid-tile button'));
  }

  it('renders every favorite in insertion order', async () => {
    storedIds = ['b', 'a'];

    const element = await render();

    expect(tiles(element).map((tile) => tile.querySelector('img')?.src)).toEqual([
      'https://picsum.photos/seed/b/600/600',
      'https://picsum.photos/seed/a/600/600',
    ]);
  });

  it('shows an empty state with a link to photos when there are no favorites', async () => {
    const element = await render();

    expect(tiles(element)).toHaveLength(0);
    expect(element.textContent).toContain('No favorites yet');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/');
  });

  it('opens the photo detail page when a favorite is clicked', async () => {
    storedIds = ['a', 'b'];
    const element = await render();

    tiles(element)[1].click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/photos/b');
  });
});
