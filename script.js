// ✅ Tipizzazione elementi del DOM
var taskInput = document.getElementById("taskInput");
var addTaskBtn = document.getElementById("addTask");
var taskList = document.getElementById("taskList");
var searchInput = document.getElementById("searchInput");
var totalTasksSpan = document.getElementById("totalTasks");
var completedTasksSpan = document.getElementById("completedTasks");
var pendingTasksSpan = document.getElementById("pendingTasks");
var markAllBtn = document.getElementById("markAll");
var removeCompletedBtn = document.getElementById("removeCompleted");
var clearAllBtn = document.getElementById("clearAll");
var sortButtons = document.querySelectorAll(".sorting button");
var loadFakeTasksBtn = document.getElementById("loadFakeTasks");
// ✅ Stato (usando array per compatibilità)
var tasks = {};
var currentSort = 'date';
var searchTerm = '';
// Carica i task dal localStorage all'avvio
loadTasks();
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter")
        addTask();
});
searchInput.addEventListener("input", function (e) {
    var target = e.target;
    searchTerm = target.value.toLowerCase();
    renderTasks();
});
markAllBtn.addEventListener("click", markAllTasks);
removeCompletedBtn.addEventListener("click", removeCompletedTasks);
clearAllBtn.addEventListener("click", clearAllTasks);
for (var i = 0; i < sortButtons.length; i++) {
    sortButtons[i].addEventListener("click", function () {
        var sortType = this.getAttribute('data-sort');
        if (sortType === 'date' || sortType === 'status') {
            setSortType(sortType);
        }
    });
}
function setSortType(sortType) {
    currentSort = sortType;
    for (var i = 0; i < sortButtons.length; i++) {
        sortButtons[i].classList.remove('active');
    }
    var activeButton = document.querySelector('.sorting button[data-sort="' + sortType + '"]');
    if (activeButton) {
        activeButton.classList.add('active');
    }
    renderTasks();
}
function addTask() {
    var text = taskInput.value.trim();
    if (text === "")
        return;
    var id = Date.now();
    var task = {
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
function toggleComplete(id) {
    var task = tasks[id];
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}
function deleteTask(id) {
    delete tasks[id];
    saveTasks();
    renderTasks();
}
function markAllTasks() {
    var taskIds = Object.keys(tasks);
    for (var i = 0; i < taskIds.length; i++) {
        var id = parseInt(taskIds[i]);
        tasks[id].completed = true;
    }
    saveTasks();
    renderTasks();
}
function removeCompletedTasks() {
    var taskIds = Object.keys(tasks);
    for (var i = 0; i < taskIds.length; i++) {
        var id = parseInt(taskIds[i]);
        if (tasks[id].completed) {
            delete tasks[id];
        }
    }
    saveTasks();
    renderTasks();
}
function clearAllTasks() {
    if (confirm("Sei sicuro di voler eliminare tutti gli incantesimi?")) {
        tasks = {};
        saveTasks();
        renderTasks();
    }
}
function updateStats() {
    var taskArray = getTasksArray();
    var total = taskArray.length;
    var completed = 0;
    for (var i = 0; i < taskArray.length; i++) {
        if (taskArray[i].completed) {
            completed++;
        }
    }
    totalTasksSpan.textContent = "Incantesimi totali: " + total;
    completedTasksSpan.textContent = "Incantesimi completati: " + completed;
    pendingTasksSpan.textContent = "Incantesimi da completare: " + (total - completed);
}
function renderTasks() {
    taskList.innerHTML = "";
    // Filtra e ordina i task
    var filteredTasks = filterTasks();
    var sortedTasks = sortTasks(filteredTasks);
    var _loop_1 = function (i) {
        var task = sortedTasks[i];
        var li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center bg-dark text-light task-item";
        if (task.completed) {
            li.classList.add("completed");
        }
        var span = document.createElement("span");
        span.textContent = task.text;
        var btnGroup = document.createElement("div");
        var completeBtn = document.createElement("button");
        completeBtn.className = "btn btn-success btn-sm me-2";
        completeBtn.textContent = task.completed ? "↶" : "✔";
        completeBtn.addEventListener("click", function () {
            toggleComplete(task.id);
        });
        var deleteBtn = document.createElement("button");
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
    };
    for (var i = 0; i < sortedTasks.length; i++) {
        _loop_1(i);
    }
    updateStats();
}
function getTasksArray() {
    var result = [];
    var keys = Object.keys(tasks);
    for (var i = 0; i < keys.length; i++) {
        var id = parseInt(keys[i]);
        result.push(tasks[id]);
    }
    return result;
}
function filterTasks() {
    if (!searchTerm)
        return getTasksArray();
    var filtered = [];
    var taskArray = getTasksArray();
    for (var i = 0; i < taskArray.length; i++) {
        var task = taskArray[i];
        if (task.text.toLowerCase().indexOf(searchTerm) !== -1) {
            filtered.push(task);
        }
    }
    return filtered;
}
function sortTasks(taskArray) {
    return taskArray.sort(function (a, b) {
        if (currentSort === 'date') {
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
        else {
            // Prima i non completati, poi i completati
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
    });
}
function saveTasks() {
    var tasksArray = getTasksArray();
    localStorage.setItem('harryPotterTasks', JSON.stringify(tasksArray));
}
function loadTasks() {
    var savedTasks = localStorage.getItem('harryPotterTasks');
    if (savedTasks) {
        var tasksArray = JSON.parse(savedTasks);
        tasks = {};
        for (var i = 0; i < tasksArray.length; i++) {
            var taskData = tasksArray[i];
            // Converti la stringa della data in oggetto Date
            tasks[taskData.id] = {
                id: taskData.id,
                text: taskData.text,
                completed: taskData.completed,
                createdAt: new Date(taskData.createdAt)
            };
        }
        function loadFakeTasks() {
            fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
                .then(function (response) { return response.json(); })
                .then(function (data) {
                data.forEach(function (item) {
                    // Genera un id unico
                    var id = Date.now() + Math.floor(Math.random() * 1000);
                    var task = {
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
                .catch(function (error) { return console.error("Errore nel caricamento dei task fake:", error); });
        }
        loadFakeTasksBtn.addEventListener("click", loadFakeTasks);
        renderTasks();
    }
}
