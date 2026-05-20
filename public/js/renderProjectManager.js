const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderStatusSelect(project) {
  const id = escapeHtml(project.id);
  return `<select class="project-row__status" data-project-status="${id}" aria-label="Status">${
    STATUS_OPTIONS.map(option =>
      `<option value="${option.value}"${option.value === project.status ? ' selected' : ''}>${option.label}</option>`,
    ).join('')
  }</select>`;
}

function renderProjectRow(project) {
  const id = escapeHtml(project.id);
  return `
    <li class="project-row" data-project-row="${id}">
      <input type="text" class="project-row__name" data-project-name="${id}" value="${escapeHtml(project.name)}" autocomplete="off" aria-label="Project name">
      ${renderStatusSelect(project)}
      <div class="project-row__actions">
        <button class="bracket-button bracket-button--quiet" type="button" data-action="manager-move-up" data-project-id="${id}" aria-label="Move up">[↑]</button>
        <button class="bracket-button bracket-button--quiet" type="button" data-action="manager-move-down" data-project-id="${id}" aria-label="Move down">[↓]</button>
        <button class="bracket-button" type="button" data-action="manager-save" data-project-id="${id}">[s] save</button>
        <button class="bracket-button bracket-button--quiet" type="button" data-action="manager-delete" data-project-id="${id}">[x] delete</button>
      </div>
    </li>`;
}

export function renderProjectManagerHtml({ projects = [], error = '' } = {}) {
  return `
    <div class="modal-backdrop" data-project-manager>
      <section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="project-manager-title">
        <header class="modal-header">
          <div class="modal-header--desktop">
            <div class="modal-header__heading">
              <span class="detail-kicker">Organize</span>
              <h2 id="project-manager-title">Projects</h2>
              <p>Create, rename, set status, reorder, and delete your projects.</p>
            </div>
            <button class="modal-header__close bracket-button bracket-button--quiet" type="button" data-action="close-project-manager" aria-label="Close projects">[x] close</button>
          </div>
          <div class="modal-header--mobile">
            <button class="modal-header__cancel bracket-button bracket-button--quiet" type="button" data-action="close-project-manager">cancel</button>
            <h2 class="modal-header__title">projects</h2>
            <span></span>
          </div>
        </header>
        <div class="project-manager">
          ${error ? `<p class="project-manager__error" role="alert">${escapeHtml(error)}</p>` : ''}
          <div class="project-manager__create">
            <input type="text" class="project-manager__new-name" data-project-new-name placeholder="New project name" autocomplete="off" aria-label="New project name">
            <button class="bracket-button bracket-button--primary" type="button" data-action="manager-create">[+] add</button>
          </div>
          <ul class="project-manager__list">
            ${projects.map(renderProjectRow).join('')}
          </ul>
        </div>
      </section>
    </div>`;
}
