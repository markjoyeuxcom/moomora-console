import { state, setState } from './state.js';
import { fetchTasks } from './taskApi.js';
import { buildMetrics, normalizeTask } from './taskModel.js';
import { renderShellHtml } from './renderShell.js';
import { renderListHtml } from './renderList.js';
import { renderTaskDetailHtml } from './renderTaskDetail.js';

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

function selectedTask() {
  if (!state.tasks.length) return null;
  return state.tasks.find((task) => task.id === state.selectedTaskId) || state.tasks[0];
}

function renderWorkspace() {
  const workspace = document.getElementById('workspace');
  if (!workspace) return;

  const task = selectedTask();
  const selectedTaskId = task?.id || null;

  workspace.innerHTML = [
    renderListHtml(state.tasks, selectedTaskId),
    renderTaskDetailHtml(task),
  ].join('');

  workspace.querySelectorAll('[data-task-id]').forEach((row) => {
    row.addEventListener('click', () => {
      setState({ selectedTaskId: row.dataset.taskId });
      renderWorkspace();
    });
  });
}

function renderShell() {
  const metrics = buildMetrics(state.tasks, today());
  app.innerHTML = renderShellHtml({
    activeContext: state.activeContext,
    activeView: state.activeView,
    apiStatus: state.apiStatus,
    metrics,
  });
  renderWorkspace();
}

async function init() {
  setState({ apiStatus: 'loading' });
  renderLoading();
  try {
    const tasks = await fetchTasks({ context: state.activeContext });
    const normalizedTasks = tasks.map(normalizeTask);
    const selectedTaskExists = normalizedTasks.some((task) => task.id === state.selectedTaskId);
    setState({
      tasks: normalizedTasks,
      apiStatus: 'connected',
      selectedTaskId: selectedTaskExists ? state.selectedTaskId : normalizedTasks[0]?.id || null,
    });
    renderShell();
  } catch (error) {
    setState({ apiStatus: 'error' });
    renderError(error.message);
  }
}

init();
