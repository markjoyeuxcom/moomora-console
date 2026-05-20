import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeProjectRow,
  buildListProjects,
  buildCreateProject,
  buildUpdateProject,
  buildArchiveProject,
  buildCountProjectDependents,
  buildDeleteProject,
} from '../../server/projectsRepository.js';

test('normalizeProjectRow maps snake_case to camelCase', () => {
  const row = {
    id: 'p1', name: 'Work', slug: 'work', status: 'active',
    sort_order: 1, created_at: 'c', updated_at: 'u',
  };
  assert.deepEqual(normalizeProjectRow(row), {
    id: 'p1', name: 'Work', slug: 'work', status: 'active',
    sortOrder: 1, createdAt: 'c', updatedAt: 'u',
  });
});

test('buildListProjects filters by status when provided', () => {
  const all = buildListProjects();
  assert.match(all.text, /from projects/);
  assert.equal(all.values.length, 0);

  const active = buildListProjects('active');
  assert.match(active.text, /where status = \$1/);
  assert.deepEqual(active.values, ['active']);
});

test('buildCreateProject inserts name, slug, status', () => {
  const q = buildCreateProject({ name: 'Work', slug: 'work', status: 'active' });
  assert.match(q.text, /insert into projects/);
  assert.deepEqual(q.values, ['Work', 'work', 'active']);
});

test('buildUpdateProject sets only provided fields', () => {
  const q = buildUpdateProject('p1', { name: 'Renamed', status: 'on-hold' });
  assert.match(q.text, /name = \$2/);
  assert.match(q.text, /status = \$3/);
  assert.deepEqual(q.values, ['p1', 'Renamed', 'on-hold']);
});

test('buildCountProjectDependents counts tasks + documents', () => {
  const q = buildCountProjectDependents('p1');
  assert.match(q.text, /from tasks/);
  assert.match(q.text, /from markdown_documents/);
  assert.deepEqual(q.values, ['p1']);
});

test('buildArchiveProject sets status archived', () => {
  const q = buildArchiveProject('p1');
  assert.match(q.text, /set status = 'archived'/);
  assert.deepEqual(q.values, ['p1']);
});

test('buildDeleteProject deletes by id', () => {
  const q = buildDeleteProject('p1');
  assert.match(q.text, /delete from projects/);
  assert.deepEqual(q.values, ['p1']);
});
