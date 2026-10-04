import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteScroll } from './infinite-scroll';

class FakeIntersectionObserver {
  static latest: FakeIntersectionObserver;

  readonly disconnect = vi.fn(() => this.targets.clear());
  private readonly targets = new Set<Element>();
  private visible = false;

  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.latest = this;
  }

  observe(target: Element): void {
    this.targets.add(target);
    this.notify(target);
  }

  unobserve(target: Element): void {
    this.targets.delete(target);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.targets.forEach((target) => this.notify(target));
  }

  private notify(target: Element): void {
    const entry = { target, isIntersecting: this.visible } as IntersectionObserverEntry;
    queueMicrotask(() => this.callback([entry], this as unknown as IntersectionObserver));
  }
}

@Component({
  imports: [InfiniteScroll],
  template: `<div appInfiniteScroll [loading]="loading()" (scrolled)="scrolled()"></div>`,
})
class Host {
  readonly loading = signal(false);
  readonly scrolled = vi.fn();
}

describe('InfiniteScroll', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  beforeEach(async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function setSentinelVisible(visible: boolean): Promise<void> {
    FakeIntersectionObserver.latest.setVisible(visible);
    await fixture.whenStable();
  }

  async function setLoading(loading: boolean): Promise<void> {
    host.loading.set(loading);
    await fixture.whenStable();
  }

  it('emits when the sentinel becomes visible', async () => {
    expect(host.scrolled).not.toHaveBeenCalled();

    await setSentinelVisible(true);

    expect(host.scrolled).toHaveBeenCalledOnce();
  });

  it('does not emit while loading', async () => {
    await setLoading(true);
    await setSentinelVisible(true);

    expect(host.scrolled).not.toHaveBeenCalled();
  });

  it('emits again after a load while the sentinel is still visible', async () => {
    await setSentinelVisible(true);
    await setLoading(true);
    await setLoading(false);

    expect(host.scrolled).toHaveBeenCalledTimes(2);
  });

  it('does not emit after a load that pushed the sentinel out of view', async () => {
    await setSentinelVisible(true);
    await setLoading(true);
    await setSentinelVisible(false);
    await setLoading(false);

    expect(host.scrolled).toHaveBeenCalledOnce();
  });

  it('disconnects the observer on destroy', () => {
    fixture.destroy();

    expect(FakeIntersectionObserver.latest.disconnect).toHaveBeenCalled();
  });
});
