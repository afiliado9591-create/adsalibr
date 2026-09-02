import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function credentials(){
  const projectId=process.env.FIREBASE_PROJECT_ID;
  const clientEmail=process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey=String(process.env.FIREBASE_PRIVATE_KEY||'').replace(/\\n/g,'\n');
  if(!projectId||!clientEmail||!privateKey) throw new Error('Firebase Admin não configurado no Netlify');
  return {projectId,clientEmail,privateKey};
}

export function db(){
  if(!getApps().length) initializeApp({credential:cert(credentials())});
  return getFirestore();
}

export { FieldValue };
