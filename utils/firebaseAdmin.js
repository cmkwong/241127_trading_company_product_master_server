import admin from 'firebase-admin';

let firebaseApp = null;

/**
 * Lazily initialise the Firebase Admin SDK from environment variables.
 *
 * Two supported configurations:
 *   1. Inline service-account values (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
 *      FIREBASE_PRIVATE_KEY) — convenient for deployment.
 *   2. Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS pointing
 *      at a downloaded service-account JSON file).
 */
const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // .env stores the key as a single line; restore real newlines.
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    firebaseApp = admin.initializeApp({
      credential: admin.applicationDefault(),
    });
  }

  return firebaseApp;
};

/**
 * Verify a Firebase ID token issued to a browser client.
 * @param {string} idToken
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
export const verifyFirebaseIdToken = async (idToken) => {
  const app = getFirebaseApp();
  return app.auth().verifyIdToken(idToken);
};

export default getFirebaseApp;
