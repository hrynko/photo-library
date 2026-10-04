import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { PhotoStreamPage } from './photo-stream-page';
import { Photo } from '../photo';
import { PhotoApi } from '../photo-api';
import { FavoritesStore } from '../../favorites/favorites-store';
import { InfiniteScroll } from '../../shared/infinite-scroll';
import { STORAGE } from '../../shared/storage';

describe('PhotoStreamPage', () => {
  let fixture: ComponentFixture<PhotoStreamPage>;
  let loader: HarnessLoader;
  let store: FavoritesStore;
  let requests: Subject<Photo[]>[];

  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        readonly observe = vi.fn();
        readonly unobserve = vi.fn();
        readonly disconnect = vi.fn();
      },
    );
    requests = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: STORAGE, useValue: { getItem: () => null, setItem: () => undefined } },
        {
          provide: PhotoApi,
          useValue: {
            getPhotos: vi.fn(() => {
              const request = new Subject<Photo[]>();
              requests.push(request);
              return request;
            }),
          },
        },
      ],
    });
    store = TestBed.inject(FavoritesStore);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(PhotoStreamPage);
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  }

  async function respond(...ids: string[]): Promise<void> {
    const request = requests.at(-1);
    request?.next(ids.map((id) => ({ id })));
    request?.complete();
    await fixture.whenStable();
  }

  async function fail(): Promise<void> {
    requests.at(-1)?.error(new Error('Network error'));
    await fixture.whenStable();
  }

  async function scrollToEnd(): Promise<void> {
    fixture.debugElement
      .query(By.directive(InfiniteScroll))
      .injector.get(InfiniteScroll)
      .scrolled.emit();
    await fixture.whenStable();
  }

  function tiles(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('app-photo-grid-tile button'));
  }

  function isLoaderShown(): Promise<boolean> {
    return loader.hasHarness(MatProgressSpinnerHarness);
  }

  function retryButton(): Promise<MatButtonHarness | null> {
    return loader.getHarnessOrNull(MatButtonHarness.with({ text: 'Retry' }));
  }

  it('loads the first batch on init and shows the loader until it arrives', async () => {
    await render();

    expect(requests).toHaveLength(1);
    expect(await isLoaderShown()).toBe(true);

    await respond('a', 'b');

    expect(tiles()).toHaveLength(2);
    expect(await isLoaderShown()).toBe(false);
  });

  it('appends the next batch when scrolled to the end', async () => {
    await render();
    await respond('a', 'b');

    await scrollToEnd();

    expect(requests).toHaveLength(2);
    expect(await isLoaderShown()).toBe(true);

    await respond('c', 'd');

    expect(tiles().map((tile) => tile.querySelector('img')?.alt)).toEqual([
      'Add photo 1 to favorites',
      'Add photo 2 to favorites',
      'Add photo 3 to favorites',
      'Add photo 4 to favorites',
    ]);
    expect(await isLoaderShown()).toBe(false);
  });

  it('does not start another request while one is in flight', async () => {
    await render();

    await scrollToEnd();

    expect(requests).toHaveLength(1);
  });

  it('adds a clicked photo to favorites and disables its tile', async () => {
    await render();
    await respond('a', 'b');

    tiles()[1].click();
    await fixture.whenStable();

    expect(store.favorites()).toEqual([{ id: 'b' }]);
    expect(tiles()[1].getAttribute('aria-disabled')).toBe('true');
    expect(tiles()[1].querySelector('img')?.alt).toBe('Photo 2, in favorites');
  });

  it('ignores clicks on photos that are already favorites', async () => {
    store.add({ id: 'a' });
    const add = vi.spyOn(store, 'add');
    await render();
    await respond('a', 'b');

    tiles()[0].click();

    expect(tiles()[0].getAttribute('aria-disabled')).toBe('true');
    expect(add).not.toHaveBeenCalled();
  });

  it('stops loading and offers a retry when a request fails', async () => {
    await render();
    await respond('a', 'b');
    await scrollToEnd();

    await fail();

    expect(await isLoaderShown()).toBe(false);
    expect(await retryButton()).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(InfiniteScroll))).toBeNull();
    expect(tiles()).toHaveLength(2);
  });

  it('loads the next batch when retry is clicked', async () => {
    await render();
    await fail();

    await (await retryButton())?.click();

    expect(requests).toHaveLength(2);
    expect(await isLoaderShown()).toBe(true);
    expect(await retryButton()).toBeNull();

    await respond('a');

    expect(tiles()).toHaveLength(1);
  });
});
