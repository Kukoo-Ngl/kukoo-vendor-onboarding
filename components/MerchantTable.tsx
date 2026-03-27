'use client';

import { useState, useEffect } from 'react';
import { Merchant } from '@/types/merchant';
import { getAllMerchants } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MerchantSlideOver from './MerchantSlideOver';

export default function MerchantTable() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filtered, setFiltered] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadMerchants = async () => {
      const data = await getAllMerchants();
      setMerchants(data);
      setFiltered(data);
      setLoading(false);
    };
    loadMerchants();
  }, []);

  useEffect(() => {
    let result = merchants;

    if (search) {
      result = result.filter(m =>
        m.businessName.toLowerCase().includes(search.toLowerCase()) ||
        m.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(m => m.category === categoryFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter);
    }

    setFiltered(result);
  }, [search, categoryFilter, statusFilter, merchants]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#1A3A6B] mb-6">Merchants</h1>

      <div className="mb-6 flex gap-4 flex-wrap">
        <Input
          placeholder="Search by business name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white z-50">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="grocery">Grocery</SelectItem>
            <SelectItem value="fresh_meat">Fresh Meat</SelectItem>
            <SelectItem value="kids_clothing">Kids Clothing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white z-50">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1A3A6B] text-white">
              <th className="border p-3 text-left">Business Name</th>
              <th className="border p-3 text-left">Category</th>
              <th className="border p-3 text-left">City</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Submitted</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-gray-50">
                <td className="border p-3">{merchant.businessName}</td>
                <td className="border p-3 capitalize">{merchant.category.replace('_', ' ')}</td>
                <td className="border p-3">{merchant.city}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded ${getStatusColor(merchant.status)}`}>
                    {merchant.status}
                  </span>
                </td>
                <td className="border p-3">{new Date(merchant.createdAt.toDate()).toLocaleDateString()}</td>
                <td className="border p-3 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMerchant(merchant);
                      setIsEditing(false);
                    }}
                    className="mr-2"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedMerchant(merchant);
                      setIsEditing(true);
                    }}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMerchant && (
        <MerchantSlideOver
          merchant={selectedMerchant}
          isEditing={isEditing}
          onClose={() => setSelectedMerchant(null)}
          onRefresh={async () => {
            const data = await getAllMerchants();
            setMerchants(data);
            setSelectedMerchant(null);
          }}
        />
      )}
    </div>
  );
}
