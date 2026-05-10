export const state = {
  tasks: [],
  selectedTaskId: null,
  activeView: 'list',
  activeContext: 'homelab',
  searchQuery: '',
  apiStatus: 'unknown',
};

export function setState(patch) {
  Object.assign(state, patch);
}
