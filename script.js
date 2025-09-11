const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const totalTasksSpan = document.getElementById("totalTasks");
const completedTasksSpan = document.getElementById("completedTasks");
const pendingTasksSpan = document.getElementById("pendingTasks");
const markAllBtn = document.getElementById("markAll");
const removeCompletedBtn = document.getElementById("removeCompleted");
const clearAllBtn = document.getElementById("clearAll");
const sortButtons = document.querySelectorAll(".sorting button");

let tasks = new Map();
let currentSort = 'date';
let searchTerm = '';

// Carica i task dal localStorage all'avvio
loadTasks();

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});

searchInput.addEventListener("input", e => {
    searchTerm = e.target.value.toLowerCase();
    renderTasks();
});

markAllBtn.addEventListener("click", markAllTasks);
removeCompletedBtn.addEventListener("click", removeCompletedTasks);
clearAllBtn.addEventListener("click", clearAllTasks);

sortButtons.forEach(button => {
    button.addEventListener("click", () => {
        const sortType = button.getAttribute('data-sort');
        setSortType(sortType);
    });
});

function setSortType(sortType) {
    currentSort = sortType;
    sortButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.sorting button[data-sort="${sortType}"]`).classList.add('active');
    renderTasks();
}

function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;

    const id = Date.now();
    const task = {
        id,
        text,
        completed: false,
        createdAt: new Date()
    };

    tasks.set(id, task);
    saveTasks();
    renderTasks();
    taskInput.value = "";
}

function toggleComplete(id) {
    const task = tasks.get(id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks.delete(id);
    saveTasks();
    renderTasks();
}

function markAllTasks() {
    for (const task of tasks.values()) {
        task.completed = true;
    }
    saveTasks();
    renderTasks();
}

function removeCompletedTasks() {
    for (const [id, task] of tasks.entries()) {
        if (task.completed) {
            tasks.delete(id);
        }
    }
    saveTasks();
    renderTasks();
}

function clearAllTasks() {
    if (confirm("Sei sicuro di voler eliminare tutti gli incantesimi?")) {
        tasks.clear();
        saveTasks();
        renderTasks();
    }
}

function updateStats() {
    const total = tasks.size;
    let completed = 0;

    for (const task of tasks.values()) {
        if (task.completed) completed++;
    }

    totalTasksSpan.textContent = `Incantesimi totali: ${total}`;
    completedTasksSpan.textContent = `Incantesimi completati: ${completed}`;
    pendingTasksSpan.textContent = `Incantesimi da completare: ${total - completed}`;
}

function renderTasks() {
    taskList.innerHTML = "";

    // Filtra e ordina i task
    const sortedTasks = sortTasks(filterTasks());

    for (const task of sortedTasks) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center bg-dark text-light task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const span = document.createElement("span");
        span.textContent = task.text;

        const btnGroup = document.createElement("div");

        const completeBtn = document.createElement("button");
        completeBtn.className = "btn btn-success btn-sm me-2";
        completeBtn.textContent = task.completed ? "↶" : "✔";
        completeBtn.addEventListener("click", () => toggleComplete(task.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener("click", () => deleteTask(task.id));

        btnGroup.appendChild(completeBtn);
        btnGroup.appendChild(deleteBtn);

        li.appendChild(span);
        li.appendChild(btnGroup);
        taskList.appendChild(li);
    }

    updateStats();
}

function filterTasks() {
    if (!searchTerm) return Array.from(tasks.values());

    const filtered = [];
    for (const task of tasks.values()) {
        if (task.text.toLowerCase().includes(searchTerm)) {
            filtered.push(task);
        }
    }
    return filtered;
}

function sortTasks(taskArray) {
    return taskArray.sort((a, b) => {
        if (currentSort === 'date') {
            return b.createdAt - a.createdAt;
        } else {
            // Prima i non completati, poi i completati
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return b.createdAt - a.createdAt;
        }
    });
}

function saveTasks() {
    const tasksArray = Array.from(tasks.values());
    localStorage.setItem('harryPotterTasks', JSON.stringify(tasksArray));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('harryPotterTasks');
    if (savedTasks) {
        const tasksArray = JSON.parse(savedTasks);
        tasks = new Map();
        for (const task of tasksArray) {
            // Assicuriamoci che createdAt sia un oggetto Date
            task.createdAt = new Date(task.createdAt);
            tasks.set(task.id, task);
        }
        renderTasks();
    }
}