import { DestroyRef, Directive, ElementRef, effect, inject, input, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScroll {
  readonly loading = input(false);
  readonly scrolled = output();

  private readonly sentinel = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.at(-1)?.isIntersecting && !this.loading()) {
          this.scrolled.emit();
        }
      },
      { rootMargin: '0px 0px 200px 0px' },
    );

    effect(() => {
      if (this.loading()) {
        observer.unobserve(this.sentinel);
      } else {
        observer.observe(this.sentinel);
      }
    });

    inject(DestroyRef).onDestroy(() => {
      observer.disconnect();
    });
  }
}
