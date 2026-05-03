# Firestore security rules — sketch (before you store data)

Use this as a **starting design** when you add Cloud Firestore. Copy the final rules into the Firebase Console (Firestore → Rules) only after you understand each line.

**Principle:** Every document path should be readable or writable **only** by the signed-in user it belongs to. Never trust the Flutter app alone—rules enforce this on the server.

---

## Data shape (example)

Later you might store saved trips per user:

```text
users/{userId}/trips/{tripId}
```

- `userId` must equal Firebase Auth’s `uid` for that user.
- No user should read or write another user’s `users/{otherUserId}/...` tree.

---

## Rules sketch (copy ideas, not blindly to production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Adjust collection names when you implement Phase 9.
    match /users/{userId} {
      allow read, update, delete: if request.auth != null
        && request.auth.uid == userId;

      allow create: if request.auth != null
        && request.auth.uid == userId;

      match /trips/{tripId} {
        allow read, write: if request.auth != null
          && request.auth.uid == userId;
      }
    }

    // Deny everything else by default (implicit at end of rules).
  }
}
```

**What this does (plain language):**

- `request.auth != null` — only signed-in users.
- `request.auth.uid == userId` — users may only touch documents whose `userId` folder matches **their** account id.

**Before you go live, add:**

- Field-level checks if clients send structured data (e.g. trip must have allowed fields, valid types).
- Indexes as prompted by the Firebase console when you run queries.
- Optional: rate limiting / abuse controls at the **backend** layer; rules alone do not replace a trusted API for AI or paid operations.

---

## When you are not using Firestore yet

You can leave Firestore **disabled** or in **locked mode** (deny all) until Phase 9. This sketch is so you **design paths and rules on paper** first, then implement storage to match—not the other way around.
