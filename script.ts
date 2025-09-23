// Definizione interfaccia tipo per Task
interface Task {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
}

// Tipizzazione elementi del DOM
const taskInput = document.getElementById("taskInput") as HTMLInputElement;
const addTaskBtn = document.getElementById("addTask") as HTMLButtonElement;
const taskList = document.getElementById("taskList") as HTMLUListElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const totalTasksSpan = document.getElementById("totalTasks") as HTMLSpanElement;
const completedTasksSpan = document.getElementById("completedTasks") as HTMLSpanElement;
const pendingTasksSpan = document.getElementById("pendingTasks") as HTMLSpanElement;
const markAllBtn = document.getElementById("markAll") as HTMLButtonElement;
const removeCompletedBtn = document.getElementById("removeCompleted") as HTMLButtonElement;
const clearAllBtn = document.getElementById("clearAll") as HTMLButtonElement;
const sortButtons = document.querySelectorAll(".sorting button") as NodeListOf<HTMLButtonElement>;
const loadFakeTasksBtn = document.getElementById("loadFakeTasks") as HTMLButtonElement;




// Stato (usando array per compatibilità)
let tasks: { [id: number]: Task } = {};
let currentSort: 'date' | 'status' = 'date';
let searchTerm: string = '';

// Carica i task dal localStorage all'avvio
loadTasks();

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") addTask();
});


searchInput.addEventListener("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    searchTerm = target.value.toLowerCase();
    renderTasks();
});

markAllBtn.addEventListener("click", markAllTasks);
removeCompletedBtn.addEventListener("click", removeCompletedTasks);
clearAllBtn.addEventListener("click", clearAllTasks);

for (let i = 0; i < sortButtons.length; i++) {
    sortButtons[i].addEventListener("click", function () {
        const sortType = this.getAttribute('data-sort') as 'date' | 'status';
        if (sortType === 'date' || sortType === 'status') {
            setSortType(sortType);
        }
    });
}

function setSortType(sortType: 'date' | 'status'): void {
    currentSort = sortType;
    for (let i = 0; i < sortButtons.length; i++) {
        sortButtons[i].classList.remove('active');
    }
    const activeButton = document.querySelector('.sorting button[data-sort="' + sortType + '"]') as HTMLButtonElement;
    if (activeButton) {
        activeButton.classList.add('active');
    }
    renderTasks();
}

function addTask(): void {
    const text = taskInput.value.trim();
    if (text === "") return;

    const id = Date.now();
    const task: Task = {
        id: id,
        text: text,
        completed: false,
        createdAt: new Date()
    };

    tasks[id] = task;
    saveTasks();
    renderTasks();
    taskInput.value = "";
}

function toggleComplete(id: number): void {
    const task = tasks[id];
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id: number): void {
    delete tasks[id];
    saveTasks();
    renderTasks();
}

function markAllTasks(): void {
    const taskIds = Object.keys(tasks);
    for (let i = 0; i < taskIds.length; i++) {
        const id = parseInt(taskIds[i]);
        tasks[id].completed = true;
    }
    saveTasks();
    renderTasks();
}

function removeCompletedTasks(): void {
    const taskIds = Object.keys(tasks);
    for (let i = 0; i < taskIds.length; i++) {
        const id = parseInt(taskIds[i]);
        if (tasks[id].completed) {
            delete tasks[id];
        }
    }
    saveTasks();
    renderTasks();
}

function clearAllTasks(): void {
    if (confirm("Sei sicuro di voler eliminare tutti gli incantesimi?")) {
        tasks = {};
        saveTasks();
        renderTasks();
    }
}

function updateStats(): void {
    const taskArray = getTasksArray();
    const total = taskArray.length;
    let completed = 0;

    for (let i = 0; i < taskArray.length; i++) {
        if (taskArray[i].completed) {
            completed++;
        }
    }

    totalTasksSpan.textContent = "Incantesimi totali: " + total;
    completedTasksSpan.textContent = "Incantesimi completati: " + completed;
    pendingTasksSpan.textContent = "Incantesimi da completare: " + (total - completed);
}

function renderTasks(): void {
    taskList.innerHTML = "";

    // Filtra e ordina i task
    const filteredTasks = filterTasks();
    const sortedTasks = sortTasks(filteredTasks);

    for (let i = 0; i < sortedTasks.length; i++) {
        const task = sortedTasks[i];
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
        completeBtn.addEventListener("click", function () {
            toggleComplete(task.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener("click", function () {
            deleteTask(task.id);
        });

        btnGroup.appendChild(completeBtn);
        btnGroup.appendChild(deleteBtn);

        li.appendChild(span);
        li.appendChild(btnGroup);
        taskList.appendChild(li);
    }

    updateStats();
}

function getTasksArray(): Task[] {
    const result: Task[] = [];
    const keys = Object.keys(tasks);
    for (let i = 0; i < keys.length; i++) {
        const id = parseInt(keys[i]);
        result.push(tasks[id]);
    }
    return result;
}

function filterTasks(): Task[] {
    if (!searchTerm) return getTasksArray();

    const filtered: Task[] = [];
    const taskArray = getTasksArray();

    for (let i = 0; i < taskArray.length; i++) {
        const task = taskArray[i];
        if (task.text.toLowerCase().indexOf(searchTerm) !== -1) {
            filtered.push(task);
        }
    }
    return filtered;
}

function sortTasks(taskArray: Task[]): Task[] {
    return taskArray.sort((a, b) => {
        if (currentSort === 'date') {
            return b.createdAt.getTime() - a.createdAt.getTime();
        } else {
            // Prima i non completati, poi i completati
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
    });
}

function saveTasks(): void {
    const tasksArray = getTasksArray();
    localStorage.setItem('harryPotterTasks', JSON.stringify(tasksArray));
}

function loadTasks(): void {
    const savedTasks = localStorage.getItem('harryPotterTasks');
    if (savedTasks) {
        const tasksArray: any[] = JSON.parse(savedTasks);
        tasks = {};
        for (let i = 0; i < tasksArray.length; i++) {
            const taskData = tasksArray[i];
            // Converti la stringa della data in oggetto Date
            tasks[taskData.id] = {
                id: taskData.id,
                text: taskData.text,
                completed: taskData.completed,
                createdAt: new Date(taskData.createdAt)
            };
        }
        function loadFakeTasks(): void {
            fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
                .then(response => response.json())
                .then((data: any[]) => {
                    data.forEach(item => {
                        const id = Date.now() + Math.floor(Math.random() * 1000);
                        const task: Task = {
                            id: id,
                            text: item.title,
                            completed: item.completed,
                            createdAt: new Date()
                        };
                        tasks[id] = task;
                    });
                    renderTasks();
                    saveTasks();
                })
                .catch(error => console.error("Errore nel caricamento dei task fake:", error));
        }

        document.addEventListener("DOMContentLoaded", () => {
            const loadFakeTasksBtn = document.getElementById("loadFakeTasks") as HTMLButtonElement;
            if (loadFakeTasksBtn) {
                loadFakeTasksBtn.addEventListener("click", loadFakeTasks);
            }
        });



        renderTasks();
    }
}