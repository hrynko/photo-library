import { DOCUMENT, InjectionToken, inject } from '@angular/core';

export const STORAGE = new InjectionToken<Pick<Storage, 'getItem' | 'setItem'> | null>('STORAGE', {
  providedIn: 'root',
  factory: () => {
    const { defaultView } = inject(DOCUMENT);
    try {
      return defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  },
});
