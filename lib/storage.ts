import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadMenuFile(merchantId: string, file: File): Promise<{ name: string; url: string; type: string } | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes`);
  }

  const storageRef = ref(storage, `merchants/${merchantId}/menus/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { name: file.name, url, type: file.type };
}

export async function uploadMultipleFiles(merchantId: string, files: File[]): Promise<{ success: Array<{ name: string; url: string; type: string }>; failed: string[] }> {
  const results = await Promise.allSettled(
    files.map(file => uploadMenuFile(merchantId, file))
  );

  const success = results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => (r as PromiseFulfilledResult<{ name: string; url: string; type: string }>).value);

  const failed = files.filter((_, idx) => results[idx].status === 'rejected').map(f => f.name);

  return { success, failed };
}

export async function deleteMenuFile(merchantId: string, fileName: string): Promise<void> {
  const storageRef = ref(storage, `merchants/${merchantId}/menus/${fileName}`);
  await deleteObject(storageRef);
}
