'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { merchantSchema, type MerchantFormData } from '@/lib/validation';
import { createMerchant } from '@/lib/firestore';
import { uploadMultipleFiles } from '@/lib/storage';
import { doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FOOD_SUBCATEGORIES = ['juice', 'biryani', 'snacks', 'breakfast', 'desserts', 'chinese', 'south_indian'];

export default function MerchantForm() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<MerchantFormData>({
    resolver: zodResolver(merchantSchema),
  });

  const category = watch('category');

  // Monitor online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear subCategory when category changes away from food
  useEffect(() => {
    if (category !== 'food') {
      setValue('subCategory', undefined);
    }
  }, [category, setValue]);

  const onSubmit = async (data: MerchantFormData) => {
    if (!isOnline) {
      toast({ title: 'Offline', description: 'Please check your internet connection', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setUploadErrors([]);

    try {
      // Pre-generate merchant ID
      const merchantId = doc(collection(db, 'merchants')).id;

      // Upload files if provided
      let menuFiles: Array<{ name: string; url: string; type: string }> = [];
      if (data.menuFiles && data.menuFiles.length > 0) {
        const { success, failed } = await uploadMultipleFiles(merchantId, data.menuFiles);
        menuFiles = success;
        if (failed.length > 0) {
          setUploadErrors(failed);
        }
      }

      // Write to Firestore
      const merchantData = {
        businessName: data.businessName,
        ownerName: data.ownerName,
        phone: data.phone,
        email: data.email,
        category: data.category,
        subCategory: data.subCategory,
        fssai: data.fssai,
        gst: data.gst,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        menuFiles,
        status: 'pending' as const,
      };

      await createMerchant(merchantId, merchantData);

      toast({
        title: 'Success',
        description: 'Merchant onboarded successfully!',
      });

      reset();
      setUploadErrors([]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FF] py-12 px-4">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50">
          You are offline. Please check your internet connection.
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#1A3A6B] mb-8">Merchant Onboarding</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Info Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-[#1A3A6B] mb-4">Business Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input {...register('businessName')} id="businessName" />
                {errors.businessName && <span className="text-red-500 text-sm">{errors.businessName.message}</span>}
              </div>

              <div>
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input {...register('ownerName')} id="ownerName" />
                {errors.ownerName && <span className="text-red-500 text-sm">{errors.ownerName.message}</span>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input {...register('phone')} id="phone" placeholder="10-digit Indian mobile" />
                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input {...register('email')} id="email" type="email" />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => {
                  const categoryValue = value as 'food' | 'grocery' | 'fresh_meat' | 'kids_clothing';
                  setValue('category', categoryValue);
                }}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="grocery">Grocery</SelectItem>
                    <SelectItem value="fresh_meat">Fresh Meat</SelectItem>
                    <SelectItem value="kids_clothing">Kids Clothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {category === 'food' && (
                <div>
                  <Label htmlFor="subCategory">Sub-Category</Label>
                  <Select onValueChange={(value) => {
                    const subCategoryValue = value as 'juice' | 'biryani' | 'snacks' | 'breakfast' | 'desserts' | 'chinese' | 'south_indian';
                    setValue('subCategory', subCategoryValue);
                  }}>
                    <SelectTrigger id="subCategory">
                      <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_SUBCATEGORIES.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-[#1A3A6B] mb-4">Compliance & Legal</h2>
            <div className="space-y-4">
              {['food', 'grocery', 'fresh_meat'].includes(category) && (
                <>
                  <div>
                    <Label htmlFor="fssaiNumber">FSSAI License Number *</Label>
                    <Input {...register('fssai.number')} id="fssaiNumber" placeholder="14 digits" />
                    {errors.fssai?.number && <span className="text-red-500 text-sm">{errors.fssai.number.message}</span>}
                  </div>

                  <div>
                    <Label htmlFor="fssaiExpiry">FSSAI Expiry Date *</Label>
                    <Input {...register('fssai.expiryDate')} id="fssaiExpiry" type="date" />
                    {errors.fssai?.expiryDate && <span className="text-red-500 text-sm">{errors.fssai.expiryDate.message}</span>}
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="gst">GST Number</Label>
                <Input {...register('gst')} id="gst" placeholder="15-char GSTIN" />
                {errors.gst && <span className="text-red-500 text-sm">{errors.gst.message}</span>}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-[#1A3A6B] mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Textarea {...register('address')} id="address" />
                {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input {...register('city')} id="city" />
                {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
              </div>

              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input {...register('pincode')} id="pincode" placeholder="6 digits" />
                {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
              </div>
            </div>
          </div>

          {/* Menu Upload Section */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold text-[#1A3A6B] mb-4">Menu Upload</h2>
            <div>
              <Label htmlFor="menuFiles">Menu Files (Max 5, 10MB each)</Label>
              <Input
                {...register('menuFiles')}
                id="menuFiles"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
              />
              {uploadErrors.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 rounded">
                  <p className="text-yellow-800 text-sm">Failed to upload: {uploadErrors.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isOnline}
            className="w-full bg-[#5BB8F5] hover:bg-[#F5A623]"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  );
}
