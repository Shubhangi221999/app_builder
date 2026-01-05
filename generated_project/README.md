# TodoListApp

**A simple, lightweight web-based Todo List application** that runs entirely in the browser. It allows users to add, edit, complete, and delete tasks with persistence via `localStorage`.

---

## Tech Stack

- **HTML** – Structure of the application.
- **CSS** – Styling and responsive layout.
- **JavaScript** – Core logic, task management, and UI interactions.

---

## Features

- Add new tasks via the input field or keyboard shortcuts.
- Edit existing tasks inline.
- Mark tasks as completed/uncompleted.
- Delete individual tasks.
- Persist tasks across sessions using `localStorage`.
- Keyboard shortcuts for fast workflow:
  - `Enter` – Add task when the input is focused.
  - `Ctrl+Enter` – Add task from anywhere on the page.
  - `Esc` – Cancel editing of a task.
- Clean, responsive UI with minimal dependencies.

---

## Setup & Usage

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```
2. **Open the app**
   - Simply open `index.html` in any modern web browser (no build step, no server required).
3. **Using the app**
   - Type a task into the input field and press **Enter** (or use the shortcuts) to add it.
   - Click the check‑mark to toggle completion.
   - Click the edit icon to modify a task; press **Esc** to cancel.
   - Click the trash icon to delete a task.

> **Note:** All tasks are saved in the browser's `localStorage`, so they persist across page reloads and browser restarts.

---

## Keyboard Shortcuts

| Shortcut      | Action                     |
|---------------|----------------------------|
| `Enter`       | Add a new task (when input is focused) |
| `Ctrl + Enter`| Add a new task from anywhere on the page |
| `Esc`         | Cancel editing a task |

---

## File Structure

```
├─ index.html      # Main HTML page; loads CSS and the deferred app.js script.
├─ styles.css      # Styling for layout, colors, and responsive design.
├─ app.js          # JavaScript core: Task class, UI handling, localStorage integration.
└─ README.md       # Project documentation (this file).
```

- **index.html** – Contains the markup for the task input, task list container, and includes the stylesheet and script. The script is loaded with `defer` to ensure the DOM is ready.
- **styles.css** – Defines the visual appearance, including task item layout, hover states, and responsive adjustments.
- **app.js** – Implements a `Task` class (with UUIDs for unique IDs), functions for CRUD operations, event listeners, and persistence logic.

---

## Design Decisions

- **Task Class & UUIDs**: Each task is represented by a `Task` class instance with a universally unique identifier (generated via `crypto.randomUUID()`). This ensures reliable identification for edit/delete operations.
- **LocalStorage Persistence**: Chosen for its simplicity and to keep the app completely client‑side without any backend.
- **Deferred Script Loading**: `app.js` is loaded with the `defer` attribute in `index.html` so the script executes after the DOM is parsed, eliminating the need for `DOMContentLoaded` listeners.

---

## Future Improvements

- **Drag‑and‑Drop Reordering** – Allow users to rearrange tasks via drag‑and‑drop.
- **Backend Sync** – Integrate with a simple REST API to sync tasks across devices.
- **Tagging & Filtering** – Add support for task categories, tags, and filter views.
- **Dark Mode** – Provide a toggle for dark/light themes.
- **Unit Tests** – Add JavaScript tests for core functionality using a testing framework like Jest.

---

## Screenshot

![Screenshot Placeholder](screenshot.png)
