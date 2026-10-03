import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Photo } from './photo';
import { PhotoApi } from './photo-api';

describe('PhotoApi', () => {
  let api: PhotoApi;

  beforeEach(() => {
    vi.useFakeTimers();
    api = TestBed.inject(PhotoApi);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function load(count: number): Promise<Photo[]> {
    const photos = firstValueFrom(api.getPhotos(count));
    await vi.advanceTimersByTimeAsync(300);
    return photos;
  }

  it('returns a batch of the requested size', async () => {
    expect(await load(12)).toHaveLength(12);
  });

  it('returns unique ids within and across batches', async () => {
    const ids = [...(await load(30)), ...(await load(30))].map((photo) => photo.id);

    expect(new Set(ids).size).toBe(60);
  });

  it.each([
    { random: 0, expectedDelay: 200 },
    { random: 0.9999, expectedDelay: 300 },
  ])(
    'emits after $expectedDelay ms when Math.random() is $random',
    async ({ random, expectedDelay }) => {
      vi.spyOn(Math, 'random').mockReturnValue(random);
      const next = vi.fn();
      api.getPhotos(1).subscribe(next);

      await vi.advanceTimersByTimeAsync(expectedDelay - 1);
      expect(next).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(next).toHaveBeenCalledOnce();
    },
  );
});
