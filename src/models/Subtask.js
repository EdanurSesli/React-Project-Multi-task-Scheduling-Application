import { collection, doc, setDoc, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';

export const createSubtask = async (boardId, taskId, title, startTime, endTime) => {
  const subtaskRef = doc(collection(db, 'boards', boardId, 'tasks', taskId, 'subtasks'));
  await setDoc(subtaskRef, { title, startTime, endTime });
  return subtaskRef.id;
};

export const deleteSubtask = async (boardId, taskId, subtaskId) => {
  const subtaskRef = doc(db, 'boards', boardId, 'tasks', taskId, 'subtasks', subtaskId);
  await deleteDoc(subtaskRef);
};

export const updateSubtask = async (boardId, taskId, subtaskId, data) => {
  const subtaskRef = doc(db, 'boards', boardId, 'tasks', taskId, 'subtasks', subtaskId);
  await updateDoc(subtaskRef, data);
};

export const listSubtasks = async (boardId, taskId) => {
  const subtasksRef = collection(db, 'boards', boardId, 'tasks', taskId, 'subtasks');
  const snapshot = await getDocs(subtasksRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};