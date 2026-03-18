import axios from "../api/axios";

export default function TaskList({ tasks, refresh, setEditTask }) {

  // 🗑️ DELETE TASK
  const deleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      refresh(); // 🔥 important to update UI
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ✅ TOGGLE COMPLETE
  const toggleComplete = async (task) => {
    try {
      await axios.put(`/tasks/${task._id}`, {
        ...task,
        completed: !task.completed
      });
      refresh();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // 🎨 PRIORITY COLORS
  const getPriorityColor = (priority) => {
    if (priority === "high") return "bg-red-500";
    if (priority === "medium") return "bg-yellow-500";
    return "bg-green-500";
  };

  // 🎨 STATUS COLORS
  const getStatusColor = (status) => {
    if (status === "todo") return "bg-gray-500";
    if (status === "inprogress") return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-3">

      {tasks.map((task) => (

        <div
          key={task._id}
          data-testid="task-card"   // ✅ important for Cypress
          className="bg-white p-4 shadow rounded flex justify-between items-center"
        >

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">

            <input
              data-testid="task-checkbox"
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task)}
            />

            <div>

              {/* TITLE */}
              <div
                data-testid="task-title-text"   // ✅ important
                className={`font-semibold text-sm ${
                  task.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {task.title}
              </div>

              {/* DESCRIPTION */}
              {task.description && (
                <div className="text-sm text-gray-500">
                  {task.description}
                </div>
              )}

              {/* TAGS */}
              <div className="flex gap-2 mt-1">

                <span className={`text-xs text-white px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>

                <span className={`text-xs text-white px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>

                {task.dueDate && (
                  <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                    Due: {task.dueDate.substring(0, 10)}
                  </span>
                )}

              </div>

            </div>

          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex gap-2">

            {/* EDIT */}
            <button
              data-testid="edit-task"
              onClick={() => setEditTask(task)}
              className="bg-yellow-400 px-3 py-1 rounded text-sm"
            >
              Edit
            </button>

            {/* DELETE */}
            <button
              data-testid="delete-task"   // ✅ critical for Cypress
              onClick={() => deleteTask(task._id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>

          </div>

        </div>

      ))}

    </div>
  );
}