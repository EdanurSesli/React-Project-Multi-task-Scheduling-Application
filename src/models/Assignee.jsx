import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const addAssignee = async (boardId, taskId, userId) => {
  try {
    const assigneeRef = doc(collection(db, 'boards', boardId, 'tasks', taskId, 'assignees'), userId);
    await setDoc(assigneeRef, { userId });
    console.log(`User ${userId} added as an assignee to task ${taskId} on board ${boardId}`);
  } catch (error) {
    console.error("Error adding assignee: ", error);
  }
};

export const assignSubtask = async (boardId, taskId, subtaskId, userId) => {
  try {
    const subtaskRef = doc(db, 'boards', boardId, 'tasks', taskId, 'subtasks', subtaskId);
    await updateDoc(subtaskRef, { assignedTo: userId });
    console.log(`User ${userId} assigned to subtask ${subtaskId} on task ${taskId} on board ${boardId}`);
  } catch (error) {
    console.error("Error assigning subtask: ", error);
  }
};

export const listAssignees = async (boardId, taskId) => {
  try {
    const assigneesRef = collection(db, 'boards', boardId, 'tasks', taskId, 'assignees');
    const snapshot = await getDocs(assigneesRef);
    const assignees = snapshot.docs.map(doc => doc.data());
    console.log(`Assignees for task ${taskId} on board ${boardId}:`, assignees);
    return assignees;
  } catch (error) {
    console.error("Error listing assignees: ", error);
    return [];
  }
};

export const assignUserToTask = async (boardId, taskId, userId) => {
  try {
    const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (taskSnap.exists()) {
      const taskData = taskSnap.data();

      const assignees = taskData.assignees ? [...taskData.assignees, userId] : [userId];

      await updateDoc(taskRef, { assignees });
      console.log(`User ${userId} assigned to task ${taskId} on board ${boardId}`);
    } else {
      console.error(`Task ${taskId} does not exist on board ${boardId}`);
    }
  } catch (error) {
    console.error("Error assigning user to task: ", error);
  }
};
