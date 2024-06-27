import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listTasks } from '../models/Task';

const TaskList = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksList = await listTasks(id);
      setTasks(tasksList);
    };
    fetchTasks();
  }, [id]);

  return (
    <div>
      <h1>Task List for Board {id}</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
