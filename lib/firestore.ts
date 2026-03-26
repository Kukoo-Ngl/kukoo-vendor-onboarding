import {
  collection,
  setDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Merchant } from '@/types/merchant';

const merchantsCollection = collection(db, 'merchants');

export async function createMerchant(merchantId: string, data: Omit<Merchant, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  await setDoc(doc(db, 'merchants', merchantId), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return merchantId;
}

export async function getMerchant(id: string): Promise<Merchant | null> {
  const snap = await getDoc(doc(db, 'merchants', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Merchant) : null;
}

export async function getAllMerchants(): Promise<Merchant[]> {
  const snap = await getDocs(merchantsCollection);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Merchant));
}

export async function updateMerchant(id: string, updates: Partial<Omit<Merchant, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'merchants', id), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteMerchant(id: string): Promise<void> {
  await deleteDoc(doc(db, 'merchants', id));
}
