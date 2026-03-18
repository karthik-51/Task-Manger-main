import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Pencil, Trash2 } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const fetchTasks = async () => {
    let url = `/tasks?`;
    if (search) url += `&search=${search}`;
    if (priority) url += `&priority=${priority}`;
    if (status) url += `&status=${status}`;

    const res = await axios.get(url);
    setTasks(res.data.tasks); // ✅ important
  };

  useEffect(() => {
    fetchTasks();
  }, [search, priority, status]);

  const updateTaskStatus = async (taskId, newStatus) => {
    await axios.put(`/tasks/${taskId}`, { status: newStatus });
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    await updateTaskStatus(taskId, newStatus);
    await fetchTasks(); // ✅ ensure UI refresh
  };

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    inprogress: tasks.filter((t) => t.status === "inprogress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 data-testid="dashboard-title" className="text-2xl font-bold">
            Task Dashboard
          </h2>

          <button
            data-testid="create-task-btn"
            onClick={() => {
              setEditTask(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            + Create Task
          </button>
        </div>

        {/* BOARD */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid md:grid-cols-3 gap-6">

            {Object.entries(columns).map(([col, columnTasks]) => (
              <Droppable droppableId={col} key={col}>
                {(provided) => (
                  <div
                    data-testid={`column-${col}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-4 rounded-xl"
                  >

                    <h3 className="font-bold mb-3">{col}</h3>

                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            data-testid="task-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 mb-3 rounded shadow"
                          >

                            {/* ✅ FIXED TITLE */}
                            <div
                              data-testid="task-title-text"
                              className="font-semibold text-sm"
                            >
                              {task.title}
                            </div>

                            <div className="flex justify-end gap-2 mt-3">

                              <button
                                data-testid="edit-task"
                                onClick={() => {
                                  setEditTask(task);
                                  setShowForm(true);
                                }}
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                data-testid="delete-task"
                                onClick={async () => {
                                  await axios.delete(`/tasks/${task._id}`);
                                  await fetchTasks(); // ✅ ensure refresh
                                }}
                              >
                                <Trash2 size={16} />
                              </button>

                            </div>

                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}

          </div>
        </DragDropContext>
      </div>

      {/* MODAL */}
      {showForm && (
        <div data-testid="task-modal" className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-[400px]">

            <button
              data-testid="close-modal"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

            <TaskForm
              refresh={() => {
                fetchTasks();
                setShowForm(false);
              }}
              editTask={editTask}
              setEditTask={setEditTask}
            />
          </div>
        </div>
      )}
    </>
  );
}