import React, { useEffect, useState } from 'react';
import { Button, Flex } from 'antd';
import { useAuth } from '../../contexts/authContext';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

const Home = () => {
    const { currentUser } = useAuth();
    const [boards, setBoards] = useState([]);
    const [tasks, setTasks] = useState({});
    const [subTasks, setSubTasks] = useState({});
    const [newTask, setNewTask] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [newSubTask, setNewSubTask] = useState('');
    const [newSubTaskDate, setNewSubTaskDate] = useState('');
    const [newSubTaskTime, setNewSubTaskTime] = useState('');
    const [newBoard, setNewBoard] = useState('');
    const [newAssignee, setNewAssignee] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [editBoardName, setEditBoardName] = useState('');
    const [isEditingBoard, setIsEditingBoard] = useState(null);
    const [isEditingTask, setIsEditingTask] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState('');
    const [editTaskDate, setEditTaskDate] = useState('');
    const [editTaskTime, setEditTaskTime] = useState('');
    const [isEditingSubTask, setIsEditingSubTask] = useState(null);
    const [editSubTaskTitle, setEditSubTaskTitle] = useState('');
    const [editSubTaskDate, setEditSubTaskDate] = useState('');
    const [editSubTaskTime, setEditSubTaskTime] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [role, setRole] = useState(0); 
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [assignedSubTasks, setAssignedSubTasks] = useState([]);
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newSubTaskAssignee, setNewSubTaskAssignee] = useState('');
    const [searchAssignee, setSearchAssignee] = useState(''); 

    const fetchRole = async () => {
        if (currentUser) {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                setRole(userDoc.data().role);
            }
        }
    };

    const fetchBoardsAndTasks = async () => {
        try {
            const boardsRef = collection(db, 'boards');
            const boardsQuery = query(boardsRef, where('userId', '==', currentUser.uid));
            const boardsSnapshot = await getDocs(boardsQuery);
            const boardsData = boardsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setBoards(boardsData);

            const tasksData = {};
            const subTasksData = {};

            for (let board of boardsData) {
                const tasksRef = collection(db, 'boards', board.id, 'tasks');
                const tasksSnapshot = await getDocs(tasksRef);
                tasksData[board.id] = tasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, assignees: doc.data().assignees || [] }));

                subTasksData[board.id] = {};

                for (let task of tasksData[board.id]) {
                    const subTasksRef = collection(db, 'boards', board.id, 'tasks', task.id, 'subtasks');
                    const subTasksSnapshot = await getDocs(subTasksRef);
                    subTasksData[board.id][task.id] = subTasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                }
            }

            setTasks(tasksData);
            setSubTasks(subTasksData);
        } catch (error) {
            console.error('Error fetching boards and tasks: ', error);
            alert("Error fetching boards and tasks. Please try again later.");
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchBoardsAndTasks();
            fetchRole();
            checkAdminPermissions();
        }
    }, [currentUser]);

    const fetchAssignedTasks = async () => {
        try {
            const boardsRef = collection(db, 'boards');
            const boardsQuery = query(boardsRef, where('userId', '==', currentUser.uid));
            const boardsSnapshot = await getDocs(boardsQuery);
            const boardsData = boardsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            const assignedTasksData = [];

            for (let board of boardsData) {
                const tasksRef = collection(db, 'boards', board.id, 'tasks');
                const tasksQuery = query(tasksRef, where('assignees', 'array-contains', currentUser.email));
                const tasksSnapshot = await getDocs(tasksQuery);
                const tasks = tasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                assignedTasksData.push(...tasks);
            }

            setAssignedTasks(assignedTasksData);
        } catch (error) {
            console.error('Error fetching assigned tasks: ', error);
            alert("Error fetching assigned tasks. Please try again later.");
        }
    };

    const fetchAssignedSubTasks = async () => {
        try {
            const boardsRef = collection(db, 'boards');
            const boardsQuery = query(boardsRef, where('userId', '==', currentUser.uid));
            const boardsSnapshot = await getDocs(boardsQuery);
            const boardsData = boardsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            const assignedSubTasksData = [];

            for (let board of boardsData) {
                const tasksRef = collection(db, 'boards', board.id, 'tasks');
                const tasksSnapshot = await getDocs(tasksRef);
                const tasksData = tasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                for (let task of tasksData) {
                    const subTasksRef = collection(db, 'boards', board.id, 'tasks', task.id, 'subtasks');
                    const subTasksQuery = query(subTasksRef, where('assignees', 'array-contains', currentUser.email));
                    const subTasksSnapshot = await getDocs(subTasksQuery);
                    const subTasks = subTasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                    assignedSubTasksData.push(...subTasks);
                }
            }

            setAssignedSubTasks(assignedSubTasksData);
        } catch (error) {
            console.error('Error fetching assigned subtasks: ', error);
            alert("Error fetching assigned subtasks. Please try again later.");
        }
    };

    const createBoard = async () => {
        if ((role === 0 || role === 1) && newBoard) {
            try {
                const newBoardObj = { name: newBoard, userId: currentUser.uid };
                await addDoc(collection(db, 'boards'), newBoardObj);
                setNewBoard('');
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error creating board: ', error);
                alert("Error creating board. Please try again later.");
            }
        } else {
            alert("You don't have permission to create a board.");
        }
    };

    const deleteBoard = async (boardId) => {
        if (role === 1) {
            try {
                await deleteDoc(doc(db, 'boards', boardId));
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error deleting board: ', error);
                alert("Error deleting board. Please try again later.");
            }
        } else {
            alert("You don't have permission to delete this board.");
        }
    };

    const updateBoard = async (boardId, newName) => {
        if (role === 1) {
            try {
                await updateDoc(doc(db, 'boards', boardId), { name: newName });
                setIsEditingBoard(null);
                setEditBoardName('');
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error updating board: ', error);
                alert("Error updating board. Please try again later.");
            }
        } else {
            alert("You don't have permission to update this board.");
        }
    };

    const createTask = async (boardId) => {
        if ((role === 0 || role === 1) && newTask && newTaskDate && newTaskTime && newTaskAssignee) {
            const newTaskObj = {
                title: newTask,
                dueDate: newTaskDate,
                dueTime: newTaskTime,
                completed: false,
                userId: currentUser.uid,
                assignees: [newTaskAssignee]
            };
            try {
                await addDoc(collection(db, 'boards', boardId, 'tasks'), newTaskObj);
                setNewTask('');
                setNewTaskDate('');
                setNewTaskTime('');
                setNewTaskAssignee('');
    
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error adding task: ', error);
                alert("Error adding task. Please try again later.");
            }
        } else {
            alert("You don't have permission to create a task or some fields are missing.");
        }
    };
    
    const createSubTask = async (boardId, taskId) => {
        if ((role === 0 || role === 1) && newSubTask && newSubTask.trim() !== '' && newSubTaskDate && newSubTaskTime && newSubTaskAssignee) {
            const newSubTaskObj = {
                title: newSubTask,
                dueDate: newSubTaskDate,
                time: newSubTaskTime,
                completed: false,
                userId: currentUser.uid,
                assignees: [newSubTaskAssignee]
            };
            try {
                await addDoc(collection(db, 'boards', boardId, 'tasks', taskId, 'subtasks'), newSubTaskObj);
                setNewSubTask('');
                setNewSubTaskDate('');
                setNewSubTaskTime('');
                setNewSubTaskAssignee('');
    
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error adding subtask: ', error);
                alert("Error adding subtask. Please try again later.");
            }
        } else {
            alert("You don't have permission to create a subtask or some fields are missing.");
        }
    };

    const deleteTask = async (boardId, taskId) => {
        if (role === 1) {
            try {
                await deleteDoc(doc(db, 'boards', boardId, 'tasks', taskId));
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error deleting task: ', error);
                alert("Error deleting task. Please try again later.");
            }
        } else {
            alert("You don't have permission to delete this task.");
        }
    };

    const deleteSubTask = async (boardId, taskId, subTaskId) => {
        if (role === 1) {
            try {
                await deleteDoc(doc(db, 'boards', boardId, 'tasks', taskId, 'subtasks', subTaskId));
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error deleting subtask: ', error);
                alert("Error deleting subtask. Please try again later.");
            }
        } else {
            alert("You don't have permission to delete this subtask.");
        }
    };

    const updateTask = async (boardId, taskId, updatedData) => {
        if (role === 1) {
            try {
                await updateDoc(doc(db, 'boards', boardId, 'tasks', taskId), updatedData);
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error updating task: ', error);
                alert("Error updating task. Please try again later.");
            }
        } else {
            alert("You don't have permission to update this task.");
        }
    };

    const updateTaskDetails = async (boardId, taskId, newTitle, newDate, newTime) => {
        if (role === 1) {
            const updatedData = {};
            if (newTitle) updatedData.title = newTitle;
            if (newDate) updatedData.dueDate = newDate;
            if (newTime) updatedData.dueTime = newTime;

            try {
                await updateDoc(doc(db, 'boards', boardId, 'tasks', taskId), updatedData);
                setIsEditingTask(null);
                setEditTaskTitle('');
                setEditTaskDate('');
                setEditTaskTime('');
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error updating task details: ', error);
                alert("Error updating task details. Please try again later.");
            }
        } else {
            alert("You don't have permission to update this task.");
        }
    };

    const updateSubTask = async (boardId, taskId, subTaskId, updatedData) => {
        if (role === 1) {
            try {
                await updateDoc(doc(db, 'boards', boardId, 'tasks', taskId, 'subtasks', subTaskId), updatedData);
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error updating subtask: ', error);
                alert("Error updating subtask. Please try again later.");
            }
        } else {
            alert("You don't have permission to update this subtask.");
        }
    };

    const updateSubTaskDetails = async (boardId, taskId, subTaskId, newTitle, newDate, newTime) => {
        if (role === 1) {
            const updatedData = {};
            if (newTitle) updatedData.title = newTitle;
            if (newDate) updatedData.dueDate = newDate;
            if (newTime) updatedData.time = newTime;

            try {
                await updateDoc(doc(db, 'boards', boardId, 'tasks', taskId, 'subtasks', subTaskId), updatedData);
                setIsEditingSubTask(null);
                setEditSubTaskTitle('');
                setEditSubTaskDate('');
                setEditSubTaskTime('');
                fetchBoardsAndTasks();
            } catch (error) {
                console.error('Error updating subtask details: ', error);
                alert("Error updating subtask details. Please try again later.");
            }
        } else {
            alert("You don't have permission to update this subtask.");
        }
    };

    const toggleTaskCompletion = async (boardId, taskId, completed) => {
        if (role === 0 || role === 1) {
            try {
                await updateTask(boardId, taskId, { completed: !completed });
            } catch (error) {
                console.error('Error toggling task completion: ', error);
                alert("Error toggling task completion. Please try again later.");
            }
        } else {
            alert("You don't have permission to update this task.");
        }
    };

    const toggleSubTaskCompletion = async (boardId, taskId, subTaskId, completed) => {
        if (role === 0 || role === 1) {
            try {
                await updateSubTask(boardId, taskId, subTaskId, { completed: !completed });
            } catch (error) {
                console.error('Error toggling subtask completion: ', error);
                alert("Error toggling subtask completion. Please try again later.");
            }
        } else {
            alert("You don't have permission to update this subtask.");
        }
    };

    const sortedTasks = (boardId) => {
        const boardTasks = tasks[boardId] || [];
        return boardTasks
            .filter(task => searchDate ? task.dueDate === searchDate : true)
            .sort((a, b) => {
                const dateA = new Date(`${a.dueDate}T${a.dueTime}`).getTime();
                const dateB = new Date(`${b.dueDate}T${b.dueTime}`).getTime();
                if (sortOrder === 'asc') {
                    return dateA - dateB;
                } else {
                    return dateB - dateA;
                }
            });
    };

    const checkAdminPermissions = async () => {
        if (currentUser && currentUser.email === 'elifedanur34@gmail.com') {
            setRole(1); 
        } else {
            setRole(0); 
        }
    };

    const sendEmail = () => {
        console.log('Email sent');
        alert('Email sent successfully!');
    };

    return (
        <div className="container mx-auto p-6">
            <div className="mb-12">
                <h1 className="text-xs font-bold mb-6">Welcome, {currentUser && (currentUser.displayName ? currentUser.displayName : currentUser.email)}</h1>
                <div className="flex space-x-4">
                    <input
                        type="text"
                        className="border rounded px-4 py-2 w-1/3"
                        placeholder="New Board Title"
                        value={newBoard}
                        onChange={e => setNewBoard(e.target.value)}
                    />
                    <Flex gap="large">
                        <Button type="primary" size="large" onClick={createBoard}>Create Board</Button>
                    </Flex>                        
                </div>
            </div>
            {boards.map(board => (
                <div key={board.id} className="mb-8 bg-white p-6 rounded shadow-md">
                    <div className="flex justify-between items-center">
                        {isEditingBoard === board.id ? (
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    className="border rounded px-4 py-2"
                                    placeholder="Edit Board Title"
                                    value={editBoardName}
                                    onChange={e => setEditBoardName(e.target.value)}
                                />
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                    onClick={() => updateBoard(board.id, editBoardName)}
                                >
                                    Save
                                </button>
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                    onClick={() => setIsEditingBoard(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center w-full">
                                <h2 className="text-2xl font-bold">{board.name}</h2>
                                <div className="flex space-x-4">
                                    <Flex gap="large">
                                        <Button type="primary" size="large" style={{ backgroundColor: 'orange', borderColor: 'orange', color: 'white' }} onClick={() => setIsEditingBoard(board.id)}>Edit</Button>
                                    </Flex>
                                    <button
                                        className="bg-red-600 text-white px-4 py-2 rounded"
                                        onClick={() => deleteBoard(board.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-6">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                className="border rounded px-4 py-2 w-1/4"
                                placeholder="New Task Title"
                                value={newTask}
                                onChange={e => setNewTask(e.target.value)}
                            />
                            <input
                                type="date"
                                className="border rounded px-4 py-2 w-1/4"
                                value={newTaskDate}
                                onChange={e => setNewTaskDate(e.target.value)}
                            />
                            <input
                                type="time"
                                className="border rounded px-4 py-2 w-1/4"
                                value={newTaskTime}
                                onChange={e => setNewTaskTime(e.target.value)}
                            />
                            <input
                                type="email"
                                className="border rounded px-4 py-2 w-1/4"
                                placeholder="Assignee Email"
                                value={newTaskAssignee}
                                onChange={e => setNewTaskAssignee(e.target.value)}
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={() => createTask(board.id)}
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 flex space-x-4">
                        <label className="self-center">Sort by:</label>
                        <button
                            className={`px-4 py-2 rounded ${sortOrder === 'asc' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
                            onClick={() => setSortOrder('asc')}
                        >
                            Asc
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${sortOrder === 'desc' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
                            onClick={() => setSortOrder('desc')}
                        >
                            Desc
                        </button>
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <label className="self-center">Search by Date:</label>
                        <input
                            type="date"
                            className="border rounded px-4 py-2"
                            value={searchDate}
                            onChange={e => setSearchDate(e.target.value)}
                        />
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <label className="self-center">Search by Assignee:</label>
                        <input
                            type="email"
                            className="border rounded px-4 py-2"
                            placeholder="Assignee Email"
                            value={searchAssignee}
                            onChange={e => setSearchAssignee(e.target.value)}
                        />
                    </div>
                    <ul className="mt-6">
                        {sortedTasks(board.id).filter(task => !searchAssignee || task.assignees.includes(searchAssignee)).map(task => (
                            <li key={task.id} className="mb-4 bg-gray-100 p-4 rounded shadow">
                                <div className="flex justify-between items-center">
                                    {isEditingTask === task.id ? (
                                        <div className="flex space-x-4">
                                            <input
                                                type="text"
                                                className="border rounded px-4 py-2"
                                                value={editTaskTitle}
                                                onChange={e => setEditTaskTitle(e.target.value)}
                                            />
                                            <input
                                                type="date"
                                                className="border rounded px-4 py-2"
                                                value={editTaskDate}
                                                onChange={e => setEditTaskDate(e.target.value)}
                                            />
                                            <input
                                                type="time"
                                                className="border rounded px-4 py-2"
                                                value={editTaskTime}
                                                onChange={e => setEditTaskTime(e.target.value)}
                                            />
                                            <button
                                                className="bg-green-600 text-white px-4 py-2 rounded"
                                                onClick={() => updateTaskDetails(board.id, task.id, editTaskTitle, editTaskDate, editTaskTime)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="bg-red-600 text-white px-4 py-2 rounded"
                                                onClick={() => setIsEditingTask(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center w-full">
                                            <span className={`${task.completed ? 'line-through' : ''}`}>{task.title} - {task.dueDate} {task.dueTime} - {task.assignees}</span>
                                            <div className="flex space-x-4">
                                                <Flex gap="large">
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        style={{ backgroundColor: 'orange', borderColor: 'orange', color: 'white' }}
                                                        onClick={() => {
                                                            setIsEditingTask(task.id);
                                                            setEditTaskTitle(task.title);
                                                            setEditTaskDate(task.dueDate);
                                                            setEditTaskTime(task.dueTime);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </Flex>
                                                <button
                                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                                    onClick={() => deleteTask(board.id, task.id)}
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    className={`px-4 py-2 rounded ${task.completed ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
                                                    onClick={() => toggleTaskCompletion(board.id, task.id, task.completed)}
                                                >
                                                    {task.completed ? 'Completed' : 'Mark as Complete'}
                                                </button>
                                                <button size="large" style={{ backgroundColor: 'black', borderColor: 'black', color: 'white', padding: '8px 16px' }} onClick={sendEmail}>Send Email</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 ml-6">
                                    <div className="flex space-x-4">
                                        <input
                                            type="text"
                                            className="border rounded px-4 py-2 w-1/3"
                                            placeholder="New Subtask Title"
                                            value={board.newSubTask}
                                            onChange={e => setNewSubTask(e.target.value)}
                                        />
                                        <input
                                            type="date"
                                            className="border rounded px-4 py-2 w-1/4"
                                            value={board.newSubTaskDate}
                                            onChange={e => setNewSubTaskDate(e.target.value)}
                                        />
                                        <input
                                            type="time"
                                            className="border rounded px-4 py-2 w-1/4"
                                            value={board.newSubTaskTime}
                                            onChange={e => setNewSubTaskTime(e.target.value)}
                                        />
                                        <input
                                            type="email"
                                            className="border rounded px-4 py-2 w-1/4"
                                            placeholder="Assignee Email"
                                            value={board.newSubTaskAssignee}
                                            onChange={e => setNewSubTaskAssignee(e.target.value)}
                                        />
                                        <button
                                            className="bg-blue-600 text-white px-4 py-2 rounded"
                                            onClick={() => createSubTask(board.id, task.id)}
                                        >
                                            Add Subtask
                                        </button>
                                    </div>
                                </div>

                                <ul className="mt-4 ml-6">
                                    {subTasks[board.id] && subTasks[board.id][task.id] && subTasks[board.id][task.id]
                                        .filter(subTask => !searchAssignee || subTask.assignees.includes(searchAssignee))
                                        .map(subTask => (
                                            <li key={subTask.id} className="mb-2 bg-white p-2 rounded shadow">
                                                <div className="flex justify-between items-center">
                                                    {isEditingSubTask === subTask.id ? (
                                                        <div className="flex space-x-4">
                                                            <input
                                                                type="text"
                                                                className="border rounded px-4 py-2"
                                                                value={editSubTaskTitle}
                                                                onChange={e => setEditSubTaskTitle(e.target.value)}
                                                            />
                                                            <input
                                                                type="date"
                                                                className="border rounded px-4 py-2"
                                                                value={editSubTaskDate}
                                                                onChange={e => setEditSubTaskDate(e.target.value)}
                                                            />
                                                            <input
                                                                type="time"
                                                                className="border rounded px-4 py-2"
                                                                value={editSubTaskTime}
                                                                onChange={e => setEditSubTaskTime(e.target.value)}
                                                            />
                                                            <button
                                                                className="bg-green-600 text-white px-4 py-2 rounded"
                                                                onClick={() => updateSubTaskDetails(board.id, task.id, subTask.id, editSubTaskTitle, editSubTaskDate, editSubTaskTime)}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                className="bg-red-600 text-white px-4 py-2 rounded"
                                                                onClick={() => setIsEditingSubTask(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className={`${subTask.completed ? 'line-through' : ''}`}>{subTask.title} - {subTask.dueDate} {subTask.time} - {subTask.assignees}</span>
                                                            <div className="flex space-x-4">
                                                                <Flex gap="large">
                                                                    <Button
                                                                        type="primary"
                                                                        size="large"
                                                                        style={{ backgroundColor: 'orange', borderColor: 'orange', color: 'white' }}
                                                                        onClick={() => {
                                                                            setIsEditingSubTask(subTask.id);
                                                                            setEditSubTaskTitle(subTask.title);
                                                                            setEditSubTaskDate(subTask.dueDate);
                                                                            setEditSubTaskTime(subTask.time);
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                </Flex>
                                                                <button
                                                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                                                    onClick={() => deleteSubTask(board.id, task.id, subTask.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                                <button
                                                                    className={`px-4 py-2 rounded ${subTask.completed ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
                                                                    onClick={() => toggleSubTaskCompletion(board.id, task.id, subTask.id, subTask.completed)}
                                                                >
                                                                    {subTask.completed ? 'Completed' : 'Mark as Complete'}
                                                                </button>
                                                                <button size="large" style={{ backgroundColor: 'black', borderColor: 'black', color: 'white', padding: '8px 16px' }} onClick={sendEmail}>Send Email</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default Home;
