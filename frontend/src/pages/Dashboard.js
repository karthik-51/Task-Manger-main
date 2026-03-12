
import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import Pagination from "../components/Pagination";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function Dashboard() {

  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [editTask, setEditTask] = useState(null);

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  const fetchTasks = async () => {

    let url = `/tasks?page=${page}`;

    if (search) url += `&search=${search}`;
    if (priority) url += `&priority=${priority}`;
    if (status) url += `&status=${status}`;

    const res = await axios.get(url);

    setTasks(res.data.tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search, priority, status]);

  const updateTaskStatus = async (taskId, status) => {
    await axios.put(`/tasks/${taskId}`, { status });
  };

  const onDragEnd = async (result) => {

    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    await updateTaskStatus(taskId, newStatus);
    fetchTasks();
  };

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    inprogress: tasks.filter((t) => t.status === "inprogress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const getColumnColor = (status) => {
    if (status === "todo") return "bg-blue-500";
    if (status === "inprogress") return "bg-yellow-500";
    if (status === "completed") return "bg-green-500";
  };

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">

        {/* FILTER BAR */}

        <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-3">

          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="border p-2 rounded flex-1"
          />

          <select
            value={priority}
            onChange={(e)=>setPriority(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

        </div>

        {/* TASK FORM */}

        <TaskForm
          refresh={fetchTasks}
          editTask={editTask}
          setEditTask={setEditTask}
        />

        {/* KANBAN BOARD */}

        <DragDropContext onDragEnd={onDragEnd}>

          <div className="grid md:grid-cols-3 gap-6 mt-6">

            {Object.entries(columns).map(([status, columnTasks]) => (

              <Droppable droppableId={status} key={status}>

                {(provided) => (

                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-4 rounded-xl shadow min-h-[450px]"
                  >

                    {/* COLUMN HEADER */}

                    <div className={`text-white text-center py-2 rounded mb-4 font-bold ${getColumnColor(status)}`}>
                      {status.toUpperCase()} ({columnTasks.length})
                    </div>

                    {columnTasks.map((task, index) => (

                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >

                        {(provided) => (

                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 mb-3 rounded-lg shadow hover:shadow-lg transition"
                          >

                            <div className="font-semibold text-gray-800">
                              {task.title}
                            </div>

                            {task.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {task.description}
                              </div>
                            )}

                            <div className="flex justify-between items-center mt-3">

                              <span className={`text-xs px-2 py-1 rounded text-white ${
                                task.priority === "high"
                                  ? "bg-red-500"
                                  : task.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}>
                                {task.priority}
                              </span>

                              <div className="flex gap-2">

                                <button
                                  onClick={() => setEditTask(task)}
                                  className="text-xs bg-yellow-400 px-2 py-1 rounded"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={async () => {
                                    await axios.delete(`/tasks/${task._id}`);
                                    fetchTasks();
                                  }}
                                  className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                                >
                                  Delete
                                </button>

                              </div>

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

        {/* PAGINATION */}

        <Pagination page={page} setPage={setPage} />

      </div>
    </>
  );
}