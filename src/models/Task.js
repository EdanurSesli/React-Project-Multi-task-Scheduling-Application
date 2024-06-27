import { collection, doc, setDoc, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';

export const createTask = async (boardId, title) => {
  const taskRef = doc(collection(db, 'boards', boardId, 'tasks'));
  await setDoc(taskRef, { title, createdAt: new Date() });
  return taskRef.id;
};

export const deleteTask = async (boardId, taskId) => {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
  await deleteDoc(taskRef);
};

export const updateTask = async (boardId, taskId, data) => {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
  await updateDoc(taskRef, data);
};

export const listTasks = async (boardId) => {
  const tasksRef = collection(db, 'boards', boardId, 'tasks');
  const snapshot = await getDocs(tasksRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};