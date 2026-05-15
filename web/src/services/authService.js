import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signUp(email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/reset-password`,
    handleCodeInApp: false,
  });
}

export async function verifyResetCode(oobCode) {
  return verifyPasswordResetCode(auth, oobCode);
}

export async function applyPasswordReset(oobCode, newPassword) {
  await confirmPasswordReset(auth, oobCode, newPassword);
}
