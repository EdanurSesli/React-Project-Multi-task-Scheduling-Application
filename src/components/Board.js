import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listTasks } from '../models/Task';

const Board = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksList = await listTasks(id);
      setTasks(tasksList);
    };
    fetchTasks();
  }, [id]);

  const events = tasks.map(task => ({
    title: task.title,
    start: new Date(task.startTime),
    end: new Date(task.endTime),
  }));

  return (
    <div>
      <h1>Board {id}</h1>
    </div>
  );
};

export default Board;