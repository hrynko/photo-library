import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Header } from './header';

@Component({ template: '' })
class Page {}

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Page },
          { path: 'favorites', component: Page },
          { path: 'photos/:id', component: Page },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    fixture = TestBed.createComponent(Header);
  });

  async function navigate(url: string): Promise<void> {
    await harness.navigateByUrl(url);
    await fixture.whenStable();
  }

  it('renders both navigation links', async () => {
    await navigate('/');
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));

    expect(links.map((link) => [link.textContent.trim(), link.getAttribute('href')])).toEqual([
      ['Photos', '/'],
      ['Favorites', '/favorites'],
    ]);
  });

  it.each([
    { url: '/', active: ['Photos'] },
    { url: '/favorites', active: ['Favorites'] },
    { url: '/photos/abc', active: [] },
  ])('highlights only the current section on $url', async ({ url, active }) => {
    await navigate(url);
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a[aria-current="page"]'),
    );

    expect(links.map((link) => link.textContent.trim())).toEqual(active);
  });
});
