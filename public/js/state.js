import { DEFAULT_PREFERENCES } from './preferences.js';

export const state = {
  tasks: [],
  documents: [],
  selectedTaskId: null,
  selectedDocumentId: null,
  activeView: 'list',
  activeProject: 'all',   // 'all' or a project id
  projects: [],           // active projects loaded from /api/projects
  searchQuery: '',
  apiStatus: 'unknown',
  isTaskFormOpen: false,
  isDrawerOpen: false,
  mobileDetailOpen: false,
  isAdminPanelOpen: false,
  isSettingsPanelOpen: false,
  settingsSection: 'appearance',
  isDocumentFormOpen: false,
  isDocumentInfoEditorOpen: false,
  editingTaskId: null,
  editingDocumentId: null,
  formError: '',
  documentFormError: '',
  documentInfoError: '',
  isSaving: false,
  adminImportMode: 'skip',
  documentEditorMode: 'preview',
  documentDraftBody: '',
  documentDraftId: null,
  isDocumentDirty: false,
  documentSaveStatus: 'Saved',
  isDocumentFocusMode: false,
  isLibraryTagsDrawerOpen: false,
  isLibraryDocOpen: false,
  activeLibraryTags: [],
  libraryTagQuery: '',
  areLibraryTagsExpanded: false,
  librarySavedViews: [],
  libraryTypeFilter: 'all',
  librarySortBy: 'updated',
  libraryGroupByType: false,
  taskDocuments: [],
  isLinkPickerOpen: false,
  linkPickerDocuments: [],
  linkPickerQuery: '',
  preferences: { ...DEFAULT_PREFERENCES },
  boardOpenSections: { 'high-priority': true, 'in-progress': true, planned: false, completed: false, notes: false },
};

export function setState(patch) {
  Object.assign(state, patch);
}

const ACTIVE_PROJECT_KEY = 'moomora.activeProject.v1';

export function loadActiveProject() {
  try {
    return window.localStorage.getItem(ACTIVE_PROJECT_KEY) || 'all';
  } catch {
    return 'all';
  }
}

export function persistActiveProject(value) {
  try {
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, value);
  } catch {
    /* ignore storage failures */
  }
}
