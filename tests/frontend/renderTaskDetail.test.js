import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTaskDetailHtml } from '../../public/js/renderTaskDetail.js';

test('detail renders bracketed action buttons for an active task', () => {
  const task = { id: 'a', title: 'X', description: '', priority: 'medium', status: 'planned', dueDate: null };
  const html = renderTaskDetailHtml(task, {});
  assert.match(html, /data-action="edit-task"[^>]*>\[e\] edit/);
  assert.match(html, /data-action="archive-task"[^>]*>\[d\] archive/);
});

test('detail renders restore and delete for archived tasks', () => {
  const task = { id: 'a', title: 'X', description: '', priority: 'low', status: 'planned', dueDate: null, archivedAt: '2026-05-01' };
  const html = renderTaskDetailHtml(task, { readOnly: true, restoreAction: true, deleteAction: true });
  assert.match(html, /data-action="restore-task"[^>]*>\[r\] restore/);
  assert.match(html, /data-action="delete-archived-task"[^>]*>\[!\] delete/);
});

test('detail renders a mobile back button when mobileDetailOpen is true', () => {
  const task = { id: 'a', title: 'X', description: '', priority: 'low', status: 'planned', dueDate: null };
  const html = renderTaskDetailHtml(task, { mobileDetailOpen: true });
  assert.match(html, /data-action="close-mobile-detail"[^>]*aria-label="Back"/);
});

test('detail omits back button when mobileDetailOpen is false', () => {
  const task = { id: 'a', title: 'X', description: '', priority: 'low', status: 'planned', dueDate: null };
  const html = renderTaskDetailHtml(task, { mobileDetailOpen: false });
  assert.doesNotMatch(html, /data-action="close-mobile-detail"/);
});
