# Photo Library

An Angular app with an infinitely scrolling stream of random photos and a Favorites library that persists in the browser.

## Prerequisites

Node.js 24 (see [.nvmrc](.nvmrc)).

## Commands

```bash
npm ci              # install
npm start           # dev server at http://localhost:4200
npm test            # unit tests (Vitest)
npm run lint        # ESLint
npm run format      # Prettier
npm run build       # production build to dist/
```

## Notes

- Photos come from `https://picsum.photos/seed/{id}/{w}/{h}`. A seed always resolves to the same image, so a random UUID is the photo's only data. It is the stable key for favorites, the `/photos/:id` route and storage.
- `PhotoApi.getPhotos(count)` emulates a backend: it is a cold `Observable` that generates ids on subscribe and emits after a random 200-300 ms. It could be swapped for an `HttpClient` call without touching components.
- Infinite scroll is a small `IntersectionObserver` directive on a sentinel after the grid. It stops observing while a batch loads and observes again afterwards. A fresh `observe()` always reports the sentinel's current state, so a batch that doesn't fill the viewport triggers the next load instead of stalling.
- Favorites live in a signal-based root store that writes ids to `localStorage` through the `STORAGE` injection token. Tests swap in an in-memory fake. Missing, corrupt or malformed data restores as an empty list rather than failing.
- `/photos/:id` is guarded by a functional `CanActivateFn`, which redirects to `/favorites` when the id isn't a favorite (stale links, or right after removal).
- The photo stream is random and kept in memory, so leaving `/` and coming back starts a new stream.
