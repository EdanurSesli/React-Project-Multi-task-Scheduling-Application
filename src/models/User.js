import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig';

export const getUser = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

export const hasPermission = async (userId, boardId, taskId) => {
  const user = await getUser(userId);
  
  return user && user.permissions && user.permissions[boardId] && user.permissions[boardId].includes(taskId);
};