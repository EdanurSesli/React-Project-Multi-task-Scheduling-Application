import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const TaskComponent = ({ boardId, taskId, userId }) => {
  const [taskData, setTaskData] = useState(null);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
        const taskSnapshot = await getDoc(taskRef);
        if (taskSnapshot.exists()) {
          setTaskData({ ...taskSnapshot.data(), id: taskSnapshot.id });
        }
      } catch (error) {
        console.error("Error fetching task data: ", error);
      }
    };

    fetchTaskData();
  }, [boardId, taskId]);

  const assignUserToTask = async () => {
    try {
      if (taskData) {
        const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
        const assignees = taskData.assignees ? [...taskData.assignees, userId] : [userId];

        await updateDoc(taskRef, { assignees });
        console.log(`User ${userId} assigned to task ${taskId} on board ${boardId}`);

        setTaskData({ ...taskData, assignees });
      }
    } catch (error) {
      console.error("Error assigning user to task: ", error);
    }
  };

  return (
    <div>
      <h1>Task Details</h1>
      {taskData && (
        <div>
          <p>Task Name: {taskData.name}</p>
          <p>Assignees: {taskData.assignees ? taskData.assignees.join(', ') : 'No assignees'}</p>
          <button onClick={assignUserToTask}>Assign User</button>
        </div>
      )}
    </div>
  );
};

export default TaskComponent;
