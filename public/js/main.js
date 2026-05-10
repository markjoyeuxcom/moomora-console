import { state } from './state.js';
import { fetchTasks } from './taskApi.js';
import { normalizeTask } from './taskModel.js';

const app = document.getElementById('app');

function renderLoading() {
  app.innerHTML = '<main class="loading">Loading TaskBoard...</main>';
}

function renderError(message) {
  app.innerHTML = `<main class="loading">TaskBoard could not load: ${message}</main>`;
}

async function init() {
  renderLoading();
  try {
    const tasks = await fetchTasks({ context: state.activeContext });
    state.tasks = tasks.map(normalizeTask);
    app.innerHTML = '<main class="loading">TaskBoard API connected.</main>';
  } catch (error) {
    renderError(error.message);
  }
}

init();
