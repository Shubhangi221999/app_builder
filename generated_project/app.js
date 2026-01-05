// app.js - Core module for Todo List App
// ------------------------------------------------------------
// Data Model
// ------------------------------------------------------------
/**
 * Represents a single todo task.
 */
class Task {
  /**
   * @param {string} id - Unique identifier (UUID).
   * @param {string} text - Task description.
   * @param {boolean} completed - Completion status.
   */
  constructor(id, text, completed = false) {
    this.id = id;
    this.text = text;
    this.completed = completed;
  }

  /**
   * Reconstruct a Task instance from a plain object (e.g., parsed JSON).
   * @param {{id:string, text:string, completed:boolean}} obj
   * @returns {Task}
   */
  static fromObject(obj) {
    return new Task(obj.id, obj.text, obj.completed);
  }
}

// ------------------------------------------------------------
// State Management
// ------------------------------------------------------------
/** @type {Task[]} */
let tasks = [];
/** @type {'all'|'active'|'completed'} */
let currentFilter = 'all';

/** Load tasks from localStorage and populate the `tasks` array. */
function loadTasks() {
  const raw = localStorage.getItem('todo-tasks');
  if (!raw) {
    tasks = [];
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      tasks = parsed.map((obj) => Task.fromObject(obj));
    } else {
      tasks = [];
    }
  } catch (e) {
    console.error('Failed to parse stored tasks:', e);
    tasks = [];
  }
}

/** Persist the current `tasks` array to localStorage. */
function saveTasks() {
  localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}

// ------------------------------------------------------------
// CRUD Operations
// ------------------------------------------------------------
/** Add a new task with the provided text. */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const newTask = new Task(crypto.randomUUID(), trimmed, false);
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  // clear the input field if it exists
  const input = document.getElementById('new-task-input');
  if (input) input.value = '';
}

/** Edit an existing task's text. */
function editTask(id, newText) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.text = newText.trim();
  saveTasks();
  renderTasks();
}

/** Delete a task by id. */
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

/** Toggle the completed flag of a task. */
function toggleTaskCompleted(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

// ------------------------------------------------------------
// Filtering & Rendering
// ------------------------------------------------------------
/** Apply a filter (all / active / completed) and re‑render. */
function applyFilter(filter) {
  currentFilter = filter;
  // Update filter button ARIA attributes / visual state
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    const isActive = btn.dataset.filter === filter;
    btn.setAttribute('aria-pressed', isActive);
    btn.classList.toggle('active', isActive);
  });
  renderTasks();
}

/** Clear the current task list UI and repopulate based on state & filter. */
function renderTasks() {
  const listEl = document.getElementById('task-list');
  if (!listEl) return;
  // Remove existing children
  listEl.innerHTML = '';

  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  visibleTasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskCompleted(task.id));
    li.appendChild(checkbox);

    // Text span (editable on double‑click)
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    textSpan.title = 'Double‑click to edit';
    textSpan.addEventListener('dblclick', () => startEditingTask(task, textSpan));
    li.appendChild(textSpan);

    // Edit button (optional shortcut to same edit UI)
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEditingTask(task, textSpan));
    li.appendChild(editBtn);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteTask(task.id));
    li.appendChild(delBtn);

    listEl.appendChild(li);
  });
}

/** Begin inline editing of a task's text. */
function startEditingTask(task, textSpan) {
  const li = textSpan.parentElement;
  if (!li) return;

  // Create input element pre‑filled with current text
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', 'Edit task');

  // Replace the span with the input
  li.replaceChild(input, textSpan);
  input.focus();
  // Move cursor to end
  input.setSelectionRange(input.value.length, input.value.length);

  const cancelEdit = () => {
    // Restore original span without changing task
    li.replaceChild(textSpan, input);
  };

  const commitEdit = () => {
    const newVal = input.value.trim();
    if (newVal && newVal !== task.text) {
      editTask(task.id, newVal);
    } else {
      // No change – just re‑render to restore UI
      renderTasks();
    }
  };

  // Handle blur (commit) and key events
  input.addEventListener('blur', commitEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur(); // triggers commitEdit via blur handler
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  });
}

// ------------------------------------------------------------
// UI Event Bindings (executed after DOM is ready)
// ------------------------------------------------------------
function bindUIEvents() {
  // Add task via button click
  const addBtn = document.getElementById('add-task-btn');
  const inputEl = document.getElementById('new-task-input');
  if (addBtn && inputEl) {
    addBtn.addEventListener('click', () => addTask(inputEl.value));
    // Enter key on input field
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask(inputEl.value);
      }
    });
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filter);
    });
  });

  // Clear completed button
  const clearBtn = document.getElementById('clear-completed-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      tasks = tasks.filter((t) => !t.completed);
      saveTasks();
      renderTasks();
    });
  }

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const inp = document.getElementById('new-task-input');
      if (inp) {
        e.preventDefault();
        addTask(inp.value);
      }
    }
  });
}

// ------------------------------------------------------------
// Initialization
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  renderTasks();
  bindUIEvents();
});

// ------------------------------------------------------------
// Export for testing / external usage
// ------------------------------------------------------------
window.todoApp = {
  addTask,
  editTask,
  deleteTask,
  toggleTaskCompleted,
  applyFilter,
  loadTasks,
  saveTasks,
  tasks, // exposing the array (reference) for inspection
};
