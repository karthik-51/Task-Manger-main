
// import { useEffect, useState } from "react";
// import axios from "../api/axios";
// import Navbar from "../components/Navbar";
// import TaskForm from "../components/TaskForm";
// import Pagination from "../components/Pagination";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// export default function Dashboard() {

//   const [tasks, setTasks] = useState([]);
//   const [page, setPage] = useState(1);

//   const [search, setSearch] = useState("");
//   const [priority, setPriority] = useState("");
//   const [status, setStatus] = useState("");

//   const [showForm, setShowForm] = useState(false);
//   const [editTask, setEditTask] = useState(null);

//   const fetchTasks = async () => {

//     let url = `/tasks?page=${page}`;

//     if (search) url += `&search=${search}`;
//     if (priority) url += `&priority=${priority}`;
//     if (status) url += `&status=${status}`;

//     const res = await axios.get(url);

//     setTasks(res.data.tasks);
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, [page, search, priority, status]);

//   const updateTaskStatus = async (taskId, status) => {
//     await axios.put(`/tasks/${taskId}`, { status });
//   };

//   const onDragEnd = async (result) => {

//     if (!result.destination) return;

//     const taskId = result.draggableId;
//     const newStatus = result.destination.droppableId;

//     await updateTaskStatus(taskId, newStatus);
//     fetchTasks();
//   };

//   const columns = {
//     todo: tasks.filter((t) => t.status === "todo"),
//     inprogress: tasks.filter((t) => t.status === "inprogress"),
//     completed: tasks.filter((t) => t.status === "completed"),
//   };

//   const getColumnColor = (status) => {
//     if (status === "todo") return "bg-blue-500";
//     if (status === "inprogress") return "bg-yellow-500";
//     if (status === "completed") return "bg-green-500";
//   };

//   return (
//     <>
//       <Navbar />

//       <div className="p-6 max-w-7xl mx-auto">

//         {/* HEADER */}

//         <div className="flex justify-between items-center mb-6">

//           <h2 className="text-2xl font-bold text-gray-700">
//             Task Dashboard
//           </h2>

//           <button
//             onClick={() => {
//               setEditTask(null);
//               setShowForm(true);
//             }}
//             className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
//           >
//             + Create Task
//           </button>

//         </div>

//         {/* FILTERS */}

//         <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3">

//           <input
//             placeholder="Search tasks..."
//             value={search}
//             onChange={(e)=>setSearch(e.target.value)}
//             className="border p-2 rounded-lg flex-1"
//           />

//           <select
//             value={priority}
//             onChange={(e)=>setPriority(e.target.value)}
//             className="border p-2 rounded-lg"
//           >
//             <option value="">All Priority</option>
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//           </select>

//           <select
//             value={status}
//             onChange={(e)=>setStatus(e.target.value)}
//             className="border p-2 rounded-lg"
//           >
//             <option value="">All Status</option>
//             <option value="todo">Todo</option>
//             <option value="inprogress">In Progress</option>
//             <option value="completed">Completed</option>
//           </select>

//         </div>

//         {/* KANBAN BOARD */}

//         <DragDropContext onDragEnd={onDragEnd}>

//           <div className="grid md:grid-cols-3 gap-6">

//             {Object.entries(columns).map(([status, columnTasks]) => (

//               <Droppable droppableId={status} key={status}>

//                 {(provided) => (

//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className="bg-gray-100 p-4 rounded-xl shadow min-h-[450px]"
//                   >

//                     <div className={`text-white text-center py-2 rounded mb-4 font-bold ${getColumnColor(status)}`}>
//                       {status.toUpperCase()} ({columnTasks.length})
//                     </div>

//                     {columnTasks.length === 0 && (
//                       <div className="text-center text-gray-400 text-sm mt-6">
//                         No tasks
//                       </div>
//                     )}

//                     {columnTasks.map((task, index) => (

//                       <Draggable
//                         key={task._id}
//                         draggableId={task._id}
//                         index={index}
//                       >

//                         {(provided) => (

//                           <div
//                             ref={provided.innerRef}
//                             {...provided.draggableProps}
//                             {...provided.dragHandleProps}
//                             className="bg-white p-4 mb-3 rounded-lg shadow hover:shadow-lg transition"
//                           >

//                             <div className="font-semibold text-gray-800">
//                               {task.title}
//                             </div>

//                             {task.description && (
//                               <div className="text-sm text-gray-500 mt-1">
//                                 {task.description}
//                               </div>
//                             )}

//                             <div className="flex justify-between items-center mt-3">

//                               <span className={`text-xs px-2 py-1 rounded text-white ${
//                                 task.priority === "high"
//                                   ? "bg-red-500"
//                                   : task.priority === "medium"
//                                   ? "bg-yellow-500"
//                                   : "bg-green-500"
//                               }`}>
//                                 {task.priority}
//                               </span>

//                               <div className="flex gap-2">

//                                 <button
//                                   onClick={() => {
//                                     setEditTask(task);
//                                     setShowForm(true);
//                                   }}
//                                   className="text-xs bg-yellow-400 px-2 py-1 rounded"
//                                 >
//                                   Edit
//                                 </button>

//                                 <button
//                                   onClick={async () => {
//                                     await axios.delete(`/tasks/${task._id}`);
//                                     fetchTasks();
//                                   }}
//                                   className="text-xs bg-red-500 text-white px-2 py-1 rounded"
//                                 >
//                                   Delete
//                                 </button>

//                               </div>

//                             </div>

//                           </div>

//                         )}

//                       </Draggable>

//                     ))}

//                     {provided.placeholder}

//                   </div>

//                 )}

//               </Droppable>

//             ))}

//           </div>

//         </DragDropContext>

//         {/* PAGINATION */}

//         <Pagination page={page} setPage={setPage} />

//       </div>

//       {/* MODAL TASK FORM */}

//       {showForm && (

//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

//           <div className="bg-white p-6 rounded-xl w-[420px] shadow-xl">

//             <div className="flex justify-between items-center mb-4">

//               <h2 className="text-xl font-bold">
//                 {editTask ? "Edit Task" : "Create Task"}
//               </h2>

//               <button
//                 onClick={() => setShowForm(false)}
//                 className="text-gray-500"
//               >
//                 ✕
//               </button>

//             </div>

//             <TaskForm
//               refresh={() => {
//                 fetchTasks();
//                 setShowForm(false);
//               }}
//               editTask={editTask}
//               setEditTask={setEditTask}
//             />

//           </div>

//         </div>

//       )}

//     </>
//   );
// }

import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import Pagination from "../components/Pagination";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Calendar, Flag, Pencil, Trash2 } from "lucide-react";

export default function Dashboard() {

  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

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

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold text-gray-800">
              Task Dashboard
            </h2>

            <p className="text-sm text-gray-500">
              Manage and track your project tasks
            </p>

          </div>

          <button
            onClick={() => {
              setEditTask(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow"
          >
            + Create Task
          </button>

        </div>

        {/* FILTERS */}

        <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3">

          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="border p-2 rounded-lg flex-1"
          />

          <select
            value={priority}
            onChange={(e)=>setPriority(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

        </div>

        {/* KANBAN BOARD */}

        <DragDropContext onDragEnd={onDragEnd}>

          <div className="grid md:grid-cols-3 gap-6">

            {Object.entries(columns).map(([status, columnTasks]) => (

              <Droppable droppableId={status} key={status}>

                {(provided) => (

                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-4 rounded-xl shadow min-h-[450px]"
                  >

                    {/* COLUMN HEADER */}

                    <div className={`flex justify-between items-center text-white px-3 py-2 rounded mb-4 font-semibold ${getColumnColor(status)}`}>

                      <span>{status.toUpperCase()}</span>

                      <span className="text-sm bg-white/20 px-2 py-1 rounded">
                        {columnTasks.length}
                      </span>

                    </div>

                    {/* EMPTY STATE */}

                    {columnTasks.length === 0 && (
                      <div className="text-center text-gray-400 mt-10">
                        <p className="text-sm">No tasks here</p>
                        <p className="text-xs mt-1">
                          Drag tasks here or create a new task
                        </p>
                      </div>
                    )}

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
                            className="bg-white p-4 mb-3 rounded-xl shadow-sm hover:shadow-lg transition border"
                          >

                            {/* TITLE */}

                            <div className="font-semibold text-gray-800 text-sm">
                              {task.title}
                            </div>

                            {/* DESCRIPTION */}

                            {task.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {task.description}
                              </div>
                            )}

                            {/* META ROW */}

                            <div className="flex justify-between items-center mt-3">

                              <div className="flex gap-2 items-center">

                                {/* PRIORITY */}

                                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded text-white ${
                                  task.priority === "high"
                                    ? "bg-red-500"
                                    : task.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}>

                                  <Flag size={12} />

                                  {task.priority}

                                </span>

                                {/* DUE DATE */}

                                {task.dueDate && (

                                  <span className="flex items-center gap-1 text-xs text-gray-500">

                                    <Calendar size={12} />

                                    {new Date(task.dueDate).toLocaleDateString()}

                                  </span>

                                )}

                              </div>

                              {/* ACTIONS */}

                              <div className="flex gap-2">

                                <button
                                  onClick={() => {
                                    setEditTask(task);
                                    setShowForm(true);
                                  }}
                                  className="text-gray-500 hover:text-yellow-600"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  onClick={async () => {
                                    await axios.delete(`/tasks/${task._id}`);
                                    fetchTasks();
                                  }}
                                  className="text-gray-500 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
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

      {/* TASK FORM MODAL */}

      {showForm && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

          <div className="bg-white p-6 rounded-xl w-[420px] shadow-xl">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-bold">
                {editTask ? "Edit Task" : "Create Task"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500"
              >
                ✕
              </button>

            </div>

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