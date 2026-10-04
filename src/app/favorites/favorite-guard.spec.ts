import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { favoriteGuard } from './favorite-guard';
import { STORAGE } from '../shared/storage';

@Component({ template: '' })
class Page {}

describe('favoriteGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'favorites', component: Page },
          { path: 'photos/:id', component: Page, canActivate: [favoriteGuard] },
        ]),
        {
          provide: STORAGE,
          useValue: { getItem: () => JSON.stringify(['a']), setItem: () => undefined },
        },
      ],
    });
  });

  async function navigate(url: string): Promise<string> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return TestBed.inject(Router).url;
  }

  it('allows a photo that is in favorites', async () => {
    expect(await navigate('/photos/a')).toBe('/photos/a');
  });

  it('redirects to favorites for a photo that is not in favorites', async () => {
    expect(await navigate('/photos/unknown')).toBe('/favorites');
  });
});
