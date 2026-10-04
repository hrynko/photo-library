import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoGrid, PhotoGridItem } from './photo-grid';

@Component({
  imports: [PhotoGrid],
  template: `<app-photo-grid [items]="items" (photoSelected)="selected($event)" />`,
})
class Host {
  readonly items: PhotoGridItem[] = [
    { photo: { id: 'a' }, label: 'Photo a' },
    { photo: { id: 'b' }, label: 'Photo b', disabled: true },
  ];
  readonly selected = vi.fn();
}

describe('PhotoGrid', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  function tiles(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button'));
  }

  it('renders a labelled tile for every photo in order', () => {
    const images: HTMLImageElement[] = Array.from(fixture.nativeElement.querySelectorAll('img'));

    expect(images.map((image) => image.alt)).toEqual(['Photo a', 'Photo b']);
    expect(images[0].src).toBe('https://picsum.photos/seed/a/600/600');
  });

  it('emits the photo when an enabled tile is clicked', () => {
    tiles()[0].click();

    expect(fixture.componentInstance.selected).toHaveBeenCalledExactlyOnceWith({ id: 'a' });
  });

  it('marks disabled tiles as aria-disabled and ignores clicks on them', () => {
    const [enabled, disabled] = tiles();

    disabled.click();

    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    expect(enabled.hasAttribute('aria-disabled')).toBe(false);
    expect(fixture.componentInstance.selected).not.toHaveBeenCalled();
  });
});
