import { state, setState } from './state.js';
import { fetchTasks } from './taskApi.js';
import { buildMetrics, normalizeTask } from './taskModel.js';
import { renderShellHtml } from './renderShell.js';

const app = document.getElementById('app');

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderLoading() {
  app.innerHTML = '<main class="loading">Loading TaskBoard...</main>';
}

function renderError(message) {
  const error = document.createElement('main');
  error.className = 'loading';
  error.textContent = `TaskBoard could not load: ${message}`;
  app.replaceChildren(error);
}

function renderShell() {
  const metrics = buildMetrics(state.tasks, today());
  app.innerHTML = renderShellHtml({
    activeContext: state.activeContext,
    activeView: state.activeView,
    apiStatus: state.apiStatus,
    metrics,
  });
}

async function init() {
  setState({ apiStatus: 'loading' });
  renderLoading();
  try {
    const tasks = await fetchTasks({ context: state.activeContext });
    setState({
      tasks: tasks.map(normalizeTask),
      apiStatus: 'connected',
    });
    renderShell();
  } catch (error) {
    setState({ apiStatus: 'error' });
    renderError(error.message);
  }
}

init();
