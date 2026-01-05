// app.js
// Core data model and persistence layer for Colorful Todo app

/**
 * Represents a single todo task.
 * @class
 */
class Task {
  /**
   * Create a task.
   * @param {string|number} id - Unique identifier for the task.
   * @param {string} text - The description of the task.
   * @param {boolean} [completed=false] - Completion status.
   * @param {number|null} [category=null] - Optional category index.
   */
  constructor(id, text, completed = false, category = null) {
    this.id = id;
    this.text = text;
    this.completed = completed;
    this.category = category; // stored as an index (e.g., 0,1,2) or null
  }
}

/**
 * In‑memory collection of tasks.
 * @type {Task[]}
 */
let tasks = [];

/**
 * Load tasks from `localStorage` (key: "colorfulTodoTasks").
 * The stored JSON is parsed and each entry is turned back into a `Task` instance.
 */
function loadTasks() {
  const raw = window.localStorage.getItem('colorfulTodoTasks');
  if (!raw) {
    tasks = [];
    return;
  }
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      tasks = data.map(item => new Task(
        item.id,
        item.text,
        item.completed,
        item.hasOwnProperty('category') ? item.category : null
      ));
    } else {
      tasks = [];
    }
  } catch (e) {
    console.error('Failed to parse tasks from localStorage:', e);
    tasks = [];
  }
}

/**
 * Persist the current `tasks` array into `localStorage`.
 */
function saveTasks() {
  try {
    const serialized = JSON.stringify(tasks);
    window.localStorage.setItem('colorfulTodoTasks', serialized);
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}

// ---------------------------------------------------------------------------
// UI handling – rendering and CRUD interaction
// ---------------------------------------------------------------------------

// Grab DOM elements (assumes they exist in index.html)
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskListEl = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle'); // optional
const colorPalette = document.getElementById('color-palette'); // container for swatches

let currentFilter = 'all'; // can be 'all', 'active', 'completed'
let selectedCategory = null; // index of chosen colour category

// ---------------------------------------------------------------------------
// Theme management
// ---------------------------------------------------------------------------
function initTheme() {
  const stored = window.localStorage.getItem('colorfulTodoTheme') || 'light';
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(stored);
  // Update toggle button aria-label for accessibility
  if (themeToggle) {
    const label = stored === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    themeToggle.setAttribute('aria-label', label);
  }
}

function toggleTheme() {
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.classList.remove(current);
  document.documentElement.classList.add(next);
  window.localStorage.setItem('colorfulTodoTheme', next);
  if (themeToggle) {
    const label = next === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    themeToggle.setAttribute('aria-label', label);
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

// ---------------------------------------------------------------------------
// Colour palette handling
// ---------------------------------------------------------------------------
const categoryColors = ['red', 'green', 'blue', 'orange']; // extend as needed

function populateColorPalette() {
  if (!colorPalette) return;
  // Clear any existing children
  colorPalette.innerHTML = '';
  categoryColors.forEach((col, idx) => {
    const swatch = document.createElement('button');
    swatch.className = 'color-swatch';
    swatch.dataset.categoryIndex = idx;
    swatch.style.backgroundColor = col;
    swatch.setAttribute('aria-label', `Select ${col} category`);
    // Highlight if currently selected
    if (selectedCategory == idx) swatch.classList.add('selected');
    swatch.addEventListener('click', () => {
      selectedCategory = idx;
      window.localStorage.setItem('selectedCategory', idx);
      // Update UI highlight
      const allSwatches = colorPalette.querySelectorAll('.color-swatch');
      allSwatches.forEach(s => s.classList.toggle('selected', s.dataset.categoryIndex == idx));
    });
    colorPalette.appendChild(swatch);
  });
}

// Load persisted selected category
function loadSelectedCategory() {
  const stored = window.localStorage.getItem('selectedCategory');
  if (stored !== null && !isNaN(stored)) {
    selectedCategory = Number(stored);
  }
}

// ---------------------------------------------------------------------------
// Rendering logic
// ---------------------------------------------------------------------------
/**
 * Render the task list according to the supplied filter.
 * @param {string} [filter='all'] - Filter mode.
 */
function renderTasks(filter = 'all') {
  currentFilter = filter;
  // Clear existing list
  taskListEl.innerHTML = '';

  const filtered = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    if (task.completed) li.classList.add('completed');
    if (task.category !== null && task.category !== undefined) {
      li.classList.add(`category-${task.category}`);
    }

    // Completion toggle
    const toggleSpan = document.createElement('span');
    toggleSpan.className = 'toggle-complete';
    toggleSpan.textContent = task.completed ? '✔' : '';
    li.appendChild(toggleSpan);

    // Task text (editable)
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.contentEditable = 'true';
    textSpan.textContent = task.text;
    li.appendChild(textSpan);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-task';
    delBtn.textContent = '✖';
    li.appendChild(delBtn);

    // Add animation class for newly added items
    li.classList.add('adding');
    li.addEventListener('animationend', () => {
      li.classList.remove('adding');
    }, { once: true });

    taskListEl.appendChild(li);
  });
}

/**
 * Add a new task.
 * @param {string} text - Task description.
 * @param {number|null} category - Optional category index.
 */
function addTask(text, category = null) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const id = Date.now(); // simple unique id
  const task = new Task(id, trimmed, false, category);
  tasks.push(task);
  saveTasks();
  renderTasks(currentFilter);
  if (newTaskInput) newTaskInput.value = '';
}

/**
 * Edit an existing task's text.
 * @param {number|string} id - Task identifier.
 * @param {string} newText - Updated description.
 */
function editTask(id, newText) {
  const task = tasks.find(t => t.id == id);
  if (!task) return;
  const trimmed = newText.trim();
  if (!trimmed) return; // ignore empty edits
  task.text = trimmed;
  saveTasks();
  renderTasks(currentFilter);
}

/**
 * Delete a task with a removal animation.
 * @param {number|string} id - Task identifier.
 */
function deleteTask(id) {
  const li = taskListEl.querySelector(`li[data-id='${id}']`);
  if (!li) {
    // Fallback – directly remove from data if element missing
    const index = tasks.findIndex(t => t.id == id);
    if (index !== -1) tasks.splice(index, 1);
    saveTasks();
    renderTasks(currentFilter);
    return;
  }
  li.classList.add('removing');
  li.addEventListener('animationend', () => {
    const index = tasks.findIndex(t => t.id == id);
    if (index !== -1) tasks.splice(index, 1);
    saveTasks();
    renderTasks(currentFilter);
  }, { once: true });
}

/**
 * Toggle completion state of a task.
 * @param {number|string} id - Task identifier.
 */
function toggleComplete(id) {
  const task = tasks.find(t => t.id == id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks(currentFilter);
}

// --------------------- Event Listeners ---------------------

if (addTaskBtn) {
  addTaskBtn.addEventListener('click', () => {
    addTask(newTaskInput ? newTaskInput.value : '', selectedCategory);
  });
}

if (newTaskInput) {
  newTaskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTaskBtn && addTaskBtn.click();
    }
  });
}

// Delegated events for task list actions
if (taskListEl) {
  taskListEl.addEventListener('click', e => {
    const target = e.target;
    const li = target.closest('li.task-item');
    if (!li) return;
    const id = li.dataset.id;

    if (target.classList.contains('toggle-complete')) {
      toggleComplete(id);
    } else if (target.classList.contains('delete-task')) {
      deleteTask(id);
    }
  });

  // Editing – blur or Enter key on the editable span
  taskListEl.addEventListener('blur', e => {
    const target = e.target;
    if (target.classList.contains('task-text')) {
      const li = target.closest('li.task-item');
      if (!li) return;
      const id = li.dataset.id;
      editTask(id, target.textContent);
    }
  }, true); // useCapture to catch blur events

  taskListEl.addEventListener('keydown', e => {
    const target = e.target;
    if (target.classList.contains('task-text') && e.key === 'Enter') {
      e.preventDefault(); // prevent newline
      target.blur();
    }
  });
}

// Filter handling – using dedicated buttons with IDs
function setFilter(filter) {
  currentFilter = filter;
  // Update active button UI
  const btnAll = document.getElementById('filter-all');
  const btnActive = document.getElementById('filter-active');
  const btnCompleted = document.getElementById('filter-completed');
  [btnAll, btnActive, btnCompleted].forEach(btn => {
    if (!btn) return;
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks(filter);
}

const filterAllBtn = document.getElementById('filter-all');
const filterActiveBtn = document.getElementById('filter-active');
const filterCompletedBtn = document.getElementById('filter-completed');
if (filterAllBtn) filterAllBtn.addEventListener('click', () => setFilter('all'));
if (filterActiveBtn) filterActiveBtn.addEventListener('click', () => setFilter('active'));
if (filterCompletedBtn) filterCompletedBtn.addEventListener('click', () => setFilter('completed'));

// ---------------------------------------------------------------------------
// Initialise app
// ---------------------------------------------------------------------------
loadTasks();
loadSelectedCategory();
initTheme();
populateColorPalette();
setFilter('all'); // will render tasks

// Expose functions for external use / testing
window.renderTasks = renderTasks;
window.addTask = addTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleComplete = toggleComplete;
window.loadTasks = loadTasks;
window.saveTasks = saveTasks;
window.Task = Task;
window.tasks = tasks;
