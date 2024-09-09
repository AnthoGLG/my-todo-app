document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  app.innerHTML = `
        <div id="task-view">
            <input type="text" id="new-task" placeholder="Nouvelle tâche">
            <button id="add-task">Ajouter</button>
            <a id="archive-link">Archive des 100 dernières tâches finalisées</a>
            <ul id="task-list"></ul>
        </div>
        <div id="archive-view" style="display: none;">
            <button id="back-to-tasks">Retour aux tâches</button>
            <ul id="archive-list"></ul>
        </div>
    `;

  const taskView = document.getElementById("task-view");
  const archiveView = document.getElementById("archive-view");
  const taskList = document.getElementById("task-list");
  const newTaskInput = document.getElementById("new-task");
  const addTaskButton = document.getElementById("add-task");
  const archiveLink = document.getElementById("archive-link");
  const archiveList = document.getElementById("archive-list");
  const backToTasksButton = document.getElementById("back-to-tasks");

  let archiveTasks = [];

  addTaskButton.addEventListener("click", () => {
    const taskText = newTaskInput.value;
    if (taskText) {
      addTask(taskText);
      newTaskInput.value = "";
      adjustAppHeight();
    }
  });

  newTaskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const taskText = newTaskInput.value;
      if (taskText) {
        addTask(taskText);
        newTaskInput.value = "";
        adjustAppHeight();
      }
    }
  });

  archiveLink.addEventListener("click", () => {
    taskView.style.display = "none";
    archiveView.style.display = "block";
    adjustAppHeight();
  });

  backToTasksButton.addEventListener("click", () => {
    archiveView.style.display = "none";
    taskView.style.display = "block";
    adjustAppHeight();
  });

  function addTask(taskText) {
    const li = document.createElement("li");
    li.draggable = true;

    const dragHandle = document.createElement("span");
    dragHandle.innerHTML = "☰";
    dragHandle.style.cursor = "move";
    dragHandle.style.marginRight = "10px";

    const span = document.createElement("span");
    span.textContent = taskText;

    li.appendChild(dragHandle);
    li.appendChild(span);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";

    const completeButton = document.createElement("button");
    completeButton.innerHTML = "✓";
    completeButton.classList.add("complete");

    completeButton.addEventListener("click", () => {
      li.classList.toggle("completed");
      if (li.classList.contains("completed")) {
        addToArchive(taskText);
        taskList.removeChild(li);
        adjustAppHeight();
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "✗";
    deleteButton.classList.add("delete");

    deleteButton.addEventListener("click", () => {
      taskList.removeChild(li);
      adjustAppHeight();
    });

    const inProgressButton = document.createElement("button");
    inProgressButton.innerHTML = "⚙️";
    inProgressButton.classList.add("in-progress");

    inProgressButton.addEventListener("click", () => {
      inProgressButton.classList.toggle("active");
      if (inProgressButton.classList.contains("active")) {
        taskList.prepend(li);
      } else {
        taskList.appendChild(li);
      }
    });

    buttonContainer.appendChild(completeButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(inProgressButton);
    li.appendChild(buttonContainer);
    taskList.appendChild(li);

    span.addEventListener("click", (e) => {
      e.stopPropagation();
      editTask(li, span);
    });

    // Drag and Drop events
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", li.id);
      setTimeout(() => {
        li.classList.add("dragging");
      }, 0);
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });

    taskList.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(taskList, e.clientY);
      const draggingElement = document.querySelector(".dragging");
      if (afterElement == null) {
        taskList.appendChild(draggingElement);
      } else {
        taskList.insertBefore(draggingElement, afterElement);
      }
    });
  }

  function addToArchive(taskText) {
    if (archiveTasks.length >= 100) {
      archiveTasks.shift();
    }
    archiveTasks.push(taskText);
    updateArchive();
  }

  function updateArchive() {
    archiveList.innerHTML = "";
    archiveTasks.forEach((taskText, index) => {
      const li = document.createElement("li");
      li.textContent = taskText;

      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = "✗";
      deleteButton.classList.add("delete");

      deleteButton.addEventListener("click", () => {
        archiveTasks.splice(index, 1);
        updateArchive();
        adjustAppHeight();
      });

      li.appendChild(deleteButton);
      archiveList.appendChild(li);
    });
    adjustAppHeight();
  }

  function editTask(li, span) {
    const currentText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.style.flexGrow = "1";

    input.addEventListener("blur", () => {
      span.textContent = input.value;
      li.replaceChild(span, input);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      }
    });

    li.replaceChild(input, span);
    input.focus();
  }

  document.addEventListener("click", (e) => {
    const inputs = document.querySelectorAll('li input[type="text"]');
    inputs.forEach((input) => {
      if (!input.contains(e.target)) {
        input.blur();
      }
    });
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll("li:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  function adjustAppHeight() {
    app.style.height = "auto";
    const taskViewHeight = taskView.scrollHeight;
    const archiveViewHeight = archiveView.scrollHeight;
    const newHeight = Math.max(taskViewHeight, archiveViewHeight, 400); // 400 est la hauteur minimale
    app.style.height = `${newHeight}px`;
  }

  adjustAppHeight(); // Ajuster la hauteur initiale
});
