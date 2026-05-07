import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "../../../core/config/firebase";

const googleProvider = new GoogleAuthProvider();

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
}

function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, normalizeEmail(email), password);
}

function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

function resetPassword(email) {
  return sendPasswordResetEmail(auth, normalizeEmail(email));
}

function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

function logout() {
  return signOut(auth);
}

function createPhoneRecaptcha(containerId) {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "normal",
  });
  return window.recaptchaVerifier;
}

function requestPhoneOtp(phoneNumber, recaptchaVerifier) {
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

export {
  createPhoneRecaptcha,
  logout,
  requestPhoneOtp,
  resetPassword,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  subscribeToAuthState,
};
