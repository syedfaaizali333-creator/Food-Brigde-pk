import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// These tests must never connect to a developer's real Firebase project.
vi.mock('../src/firebase.js', () => ({ isConfigured: false, auth: null, db: null, googleProvider: {}, errorMessage: (error) => error.message }));

function loadPage(file, url) {
  window.history.replaceState({}, '', url);
  const html = readFileSync(resolve(process.cwd(), file), 'utf8');
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = parsed.body.innerHTML;
}

beforeEach(() => { vi.resetModules(); document.body.innerHTML = ''; });

describe('public navigation and registration', () => {
  it('does not advertise admin or privileged food actions in the public navigation', async () => {
    loadPage('index.html', '/index.html');
    await import('../src/pages/static.js');
    const nav = document.querySelector('#site-header');
    expect(nav.textContent).toContain('Join FoodBridge');
    expect(nav.querySelector('a[href="register.html"]').textContent).toBe('Sign in');
    expect(nav.textContent).not.toMatch(/admin|add food|donate food/i);
    const toggle = nav.querySelector('.menu-toggle');
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(nav.querySelector('#site-nav').classList.contains('is-open')).toBe(true);
  });
  it('shows verification fields only for businesses and organizations', async () => {
    loadPage('register.html', '/register.html?role=restaurant');
    await import('../src/pages/register.js');
    expect(document.getElementById('register-form').hidden).toBe(true);
    expect(document.getElementById('google-register').disabled).toBe(true);
    expect(document.querySelector('input[name=role]:checked').value).toBe('restaurant');
    expect(document.querySelector('#register-contact').closest('[data-business-only]').hidden).toBe(false);
    expect(document.querySelector('#register-contact').required).toBe(true);
    const individual = document.querySelector('input[name=role][value=individual]');
    individual.checked = true;
    individual.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.querySelector('#register-contact').closest('[data-business-only]').hidden).toBe(true);
    expect(document.querySelector('#register-contact').required).toBe(false);
    expect(document.querySelector('#register-website').disabled).toBe(true);
    expect(document.querySelector('#register-evidence').disabled).toBe(true);
  });
  it('does not pretend login works if Firebase has not been configured', async () => {
    loadPage('login.html', '/login.html');
    await import('../src/pages/login.js');
    expect(document.querySelector('#setup-message').hidden).toBe(false);
    expect(document.querySelector('#google-login').disabled).toBe(true);
    expect(document.querySelector('#login-form button[type=submit]').disabled).toBe(true);
  });
  it('renders only safe food images and hides a failed image', async () => {
    const { foodPhotoMarkup, hideBrokenFoodPhotos } = await import('../src/ui.js');
    expect(foodPhotoMarkup('javascript:alert(1)', 'Rice')).toBe('');
    expect(foodPhotoMarkup('http://127.0.0.1/food.jpg', 'Rice')).toBe('');
    expect(foodPhotoMarkup(undefined, 'Rice')).toBe('');
    document.body.innerHTML = `<div id="cards">${foodPhotoMarkup('https://example.org/food.jpg?a=1&b=2', 'Rice " onerror="bad')}</div>`;
    const cards = document.getElementById('cards');
    const image = cards.querySelector('img');
    expect(image.getAttribute('src')).toBe('https://example.org/food.jpg?a=1&b=2');
    expect(image.getAttribute('alt')).toBe('Photo of Rice " onerror="bad');
    expect(image.hasAttribute('onerror')).toBe(false);
    expect(image.getAttribute('referrerpolicy')).toBe('no-referrer');
    hideBrokenFoodPhotos(cards);
    image.dispatchEvent(new Event('error'));
    expect(image.hidden).toBe(true);
  });
  it('keeps the restaurant donation form and its action hidden without Firebase access', async () => {
    loadPage('donor-dashboard.html', '/donor-dashboard.html');
    await import('../src/pages/donor.js');
    await Promise.resolve();
    expect(document.querySelector('#access-state').textContent).toContain('Firebase setup required');
    expect(document.querySelector('#protected-content').hidden).toBe(true);
    expect(document.querySelector('#donor-action').hidden).toBe(true);
  });
});
