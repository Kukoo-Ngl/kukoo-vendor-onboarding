'use client';

import { useState } from 'react';
import { Merchant } from '@/types/merchant';
import { updateMerchant, deleteMerchant } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const FOOD_SUBCATEGORIES = ['juice', 'biryani', 'snacks', 'breakfast', 'desserts', 'chinese', 'south_indian'];

interface Props {
  merchant: Merchant;
  isEditing: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

export default function MerchantSlideOver({ merchant, isEditing, onClose, onRefresh }: Props) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(isEditing);
  const [formData, setFormData] = useState(merchant);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMerchant(merchant.id, {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
        category: formData.category,
        subCategory: formData.subCategory,
        fssai: formData.fssai,
        gst: formData.gst,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        status: formData.status,
      });
      toast({ title: 'Updated', description: 'Merchant updated successfully' });
      setEditing(false);
      await onRefresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;
    setLoading(true);
    try {
      await deleteMerchant(merchant.id);
      toast({ title: 'Deleted', description: 'Merchant deleted' });
      await onRefresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-lg overflow-y-auto">
        <div className="sticky top-0 bg-[#1A3A6B] text-white p-6 flex justify-between">
          <h2>{editing ? 'Edit' : 'View'} Merchant</h2>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {editing ? (
            <>
              <div>
                <Label>Business Name</Label>
                <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
              </div>
              <div>
                <Label>Owner Name</Label>
                <Input value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => {
                  const categoryValue = value as 'food' | 'grocery' | 'fresh_meat' | 'kids_clothing';
                  setFormData({ ...formData, category: categoryValue });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="grocery">Grocery</SelectItem>
                    <SelectItem value="fresh_meat">Fresh Meat</SelectItem>
                    <SelectItem value="kids_clothing">Kids Clothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.category === 'food' && (
                <div>
                  <Label>Sub-Category</Label>
                  <Select value={(formData.subCategory?.[0]) || ''} onValueChange={(value) => {
                    const subCategoryValue = value as 'juice' | 'biryani' | 'snacks' | 'breakfast' | 'desserts' | 'chinese' | 'south_indian';
                    setFormData({ ...formData, subCategory: [subCategoryValue] });
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_SUBCATEGORIES.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {['food', 'grocery', 'fresh_meat'].includes(formData.category) && (
                <>
                  <div>
                    <Label>FSSAI Number</Label>
                    <Input value={formData.fssai?.number || ''} onChange={(e) => setFormData({ ...formData, fssai: { number: e.target.value, expiryDate: formData.fssai?.expiryDate || '' } })} />
                  </div>
                  <div>
                    <Label>FSSAI Expiry</Label>
                    <Input type="date" value={formData.fssai?.expiryDate || ''} onChange={(e) => setFormData({ ...formData, fssai: { number: formData.fssai?.number || '', expiryDate: e.target.value } })} />
                  </div>
                </>
              )}
              <div>
                <Label>GST</Label>
                <Input value={formData.gst || ''} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div>
                <Label>Pincode</Label>
                <Input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: string) => setFormData({ ...formData, status: value as 'pending' | 'approved' | 'rejected' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <p><strong>Business:</strong> {merchant.businessName}</p>
              <p><strong>Owner:</strong> {merchant.ownerName}</p>
              <p><strong>Phone:</strong> {merchant.phone}</p>
              <p><strong>Email:</strong> {merchant.email}</p>
              <p><strong>Category:</strong> {merchant.category}</p>
              {merchant.menuFiles.length > 0 && (
                <>
                  <p><strong>Menu Files:</strong></p>
                  <ul className="list-disc ml-5">
                    {merchant.menuFiles.map((file, idx) => (
                      <li key={idx}><a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{file.name}</a></li>
                    ))}
                  </ul>
                </>
              )}
              <p><strong>Status:</strong> {merchant.status}</p>
            </>
          )}

          <div className="flex gap-3 pt-6">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={loading} className="bg-[#5BB8F5]">Save</Button>
                <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditing(true)} className="bg-[#5BB8F5]">Edit</Button>
                <Button onClick={handleDelete} variant="destructive">Delete</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
