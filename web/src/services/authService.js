import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

// After the user clicks the verification link, Firebase redirects them here.
// window.location.origin = localhost:5173 in dev, your real domain in production.
function verificationSettings() {
  return {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  };
}

export async function signUp(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  await sendEmailVerification(credential.user, verificationSettings());
  await signOut(auth);
}

export async function resendVerificationEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (credential.user.emailVerified) return 'already_verified';
  await sendEmailVerification(credential.user, verificationSettings());
  await signOut(auth);
  return 'sent';
}

export async function checkVerificationStatus(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  if (user.emailVerified) return true;
  await signOut(auth);
  return false;
}

export async function login(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
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
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  });
}

