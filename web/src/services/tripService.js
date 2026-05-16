import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export async function saveTrip(userId, tripData) {
  const ref = collection(db, 'users', userId, 'trips');
  const docRef = await addDoc(ref, {
    title:    tripData.title,
    location: tripData.location,
    budget:   tripData.budget,
    plan:     tripData.plan,
    savedAt:  serverTimestamp(),
  });
  return docRef.id;
}

export async function loadTrips(userId) {
  const ref = collection(db, 'users', userId, 'trips');
  const q   = query(ref, orderBy('savedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id:       d.id,
    ...d.data(),
    savedAt:  d.data().savedAt?.toDate() ?? new Date(),
  }));
}

export async function deleteTrip(userId, tripId) {
  await deleteDoc(doc(db, 'users', userId, 'trips', tripId));
}

export async function updateTripTitle(userId, tripId, newTitle) {
  await updateDoc(doc(db, 'users', userId, 'trips', tripId), { title: newTitle });
}
