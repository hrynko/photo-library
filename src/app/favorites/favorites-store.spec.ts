import { TestBed } from '@angular/core/testing';

import { FavoritesStore } from './favorites-store';
import { STORAGE } from '../shared/storage';

const STORAGE_KEY = 'photo-library.favorites';

describe('FavoritesStore', () => {
  let stored: Map<string, string>;

  beforeEach(() => {
    stored = new Map();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: STORAGE,
          useValue: {
            getItem: (key: string) => stored.get(key) ?? null,
            setItem: (key: string, value: string) => stored.set(key, value),
          },
        },
      ],
    });
  });

  function createStore(): FavoritesStore {
    return TestBed.inject(FavoritesStore);
  }

  function storedIds(): unknown {
    return JSON.parse(stored.get(STORAGE_KEY) ?? 'null');
  }

  it('adds photos in insertion order', () => {
    const store = createStore();

    store.add({ id: 'b' });
    store.add({ id: 'a' });

    expect(store.favorites()).toEqual([{ id: 'b' }, { id: 'a' }]);
    expect(store.has('a')).toBe(true);
    expect(store.has('c')).toBe(false);
  });

  it('never adds the same photo twice', () => {
    const store = createStore();

    store.add({ id: 'a' });
    store.add({ id: 'a' });

    expect(store.favorites()).toEqual([{ id: 'a' }]);
  });

  it('removes a photo', () => {
    const store = createStore();
    store.add({ id: 'a' });
    store.add({ id: 'b' });

    store.remove('a');

    expect(store.favorites()).toEqual([{ id: 'b' }]);
    expect(store.has('a')).toBe(false);
  });

  it('persists every change', () => {
    const store = createStore();

    store.add({ id: 'a' });
    store.add({ id: 'b' });
    expect(storedIds()).toEqual(['a', 'b']);

    store.remove('a');
    expect(storedIds()).toEqual(['b']);
  });

  it('restores favorites from storage', () => {
    stored.set(STORAGE_KEY, JSON.stringify(['b', 'a']));

    const store = createStore();

    expect(store.favorites()).toEqual([{ id: 'b' }, { id: 'a' }]);
    expect(store.has('a')).toBe(true);
  });

  it('starts empty when nothing is stored', () => {
    expect(createStore().favorites()).toEqual([]);
  });

  it.each([
    { case: 'invalid JSON', value: '{not json' },
    { case: 'a non-array value', value: '{"id":"a"}' },
  ])('starts empty when storage holds $case', ({ value }) => {
    stored.set(STORAGE_KEY, value);

    expect(createStore().favorites()).toEqual([]);
  });

  it('keeps favorites in memory when storage writes fail', () => {
    TestBed.overrideProvider(STORAGE, {
      useValue: {
        getItem: () => null,
        setItem: () => {
          throw new DOMException('Quota exceeded', 'QuotaExceededError');
        },
      },
    });
    const store = createStore();

    store.add({ id: 'a' });

    expect(store.favorites()).toEqual([{ id: 'a' }]);
  });

  it('works in memory when storage is unavailable', () => {
    TestBed.overrideProvider(STORAGE, { useValue: null });
    const store = createStore();

    store.add({ id: 'a' });

    expect(store.favorites()).toEqual([{ id: 'a' }]);
  });

  it('drops invalid and duplicate entries from storage', () => {
    stored.set(STORAGE_KEY, JSON.stringify(['a', 42, null, '', 'a', 'b']));

    expect(createStore().favorites()).toEqual([{ id: 'a' }, { id: 'b' }]);
  });
});
