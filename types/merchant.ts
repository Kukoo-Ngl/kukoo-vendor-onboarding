import { Timestamp } from 'firebase/firestore';

export type Merchant = {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  category: 'food' | 'grocery' | 'fresh_meat' | 'kids_clothing';
  subCategory?: 'juice' | 'biryani' | 'snacks' | 'breakfast' | 'desserts' | 'chinese' | 'south_indian';
  fssai?: {
    number: string;
    expiryDate: string;
  };
  gst?: string;
  address: string;
  city: string;
  pincode: string;
  menuFiles: {
    name: string;
    url: string;
    type: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
