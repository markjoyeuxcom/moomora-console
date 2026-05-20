import test from 'node:test';
import assert from 'node:assert/strict';
import { renderProjectManagerHtml } from '../../public/js/renderProjectManager.js';

const PROJECTS = [
  { id: 'p1', name: 'Homelab', slug: 'homelab', status: 'active', sortOrder: 0 },
  { id: 'p2', name: 'Work', slug: 'work', status: 'on-hold', sortOrder: 1 },
];

test('renders the modal chrome with a close action', () => {
  const html = renderProjectManagerHtml({ projects: PROJECTS });
  assert.match(html, /class="modal-backdrop" data-project-manager/);
  assert.match(html, /data-action="close-project-manager"/);
});

test('renders a row per project with name input and status select preselected', () => {
  const html = renderProjectManagerHtml({ projects: PROJECTS });
  assert.match(html, /data-project-row="p1"/);
  assert.match(html, /data-project-name="p1"[^>]*value="Homelab"/);
  assert.match(html, /data-project-row="p2"/);
  assert.match(html, /data-project-status="p2"[\s\S]*?<option value="on-hold" selected>/);
  assert.match(html, /data-action="manager-save" data-project-id="p1"/);
  assert.match(html, /data-action="manager-delete" data-project-id="p1"/);
  assert.match(html, /data-action="manager-move-up" data-project-id="p1"/);
  assert.match(html, /data-action="manager-move-down" data-project-id="p1"/);
});

test('renders the create row', () => {
  const html = renderProjectManagerHtml({ projects: PROJECTS });
  assert.match(html, /data-project-new-name/);
  assert.match(html, /data-action="manager-create"/);
});

test('renders all four status options for each row', () => {
  const html = renderProjectManagerHtml({ projects: [PROJECTS[0]] });
  for (const value of ['active', 'on-hold', 'completed', 'archived']) {
    assert.match(html, new RegExp(`<option value="${value}"`));
  }
});

test('escapes project names', () => {
  const html = renderProjectManagerHtml({ projects: [{ id: 'p1', name: '<script>x</script>', slug: 'x', status: 'active', sortOrder: 0 }] });
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('shows an error banner when error is provided', () => {
  const html = renderProjectManagerHtml({ projects: PROJECTS, error: 'Could not delete' });
  assert.match(html, /project-manager__error/);
  assert.match(html, /Could not delete/);
});

test('renders an empty list without throwing', () => {
  const html = renderProjectManagerHtml({ projects: [] });
  assert.match(html, /project-manager__list/);
});
