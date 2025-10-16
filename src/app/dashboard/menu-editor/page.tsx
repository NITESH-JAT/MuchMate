// src/app/dashboard/menu-editor/page.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { MenuItem } from '@/lib/types';
import Image from 'next/image';

export default function MenuEditorPage() {
  const { taxRate, setTaxRate, menuItems, setMenuItems } = useCart();
  const [localTaxRate, setLocalTaxRate] = useState((taxRate * 100).toString());
  const [isEditing, setIsEditing] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editedItem, setEditedItem] = useState<Partial<MenuItem>>({});
  const { toast } = useToast();

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTaxRate(e.target.value);
  };

  const handleSaveTaxRate = () => {
    const newRate = parseFloat(localTaxRate);
    if (!isNaN(newRate) && newRate >= 0) {
      setTaxRate(newRate / 100);
      toast({
        title: 'Tax Rate Updated',
        description: `The tax rate has been set to ${newRate}%.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Tax Rate',
        description: 'Please enter a valid number for the tax rate.',
      });
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setIsEditing(item);
    setEditedItem({ ...item });
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditedItem({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: { url: 'https://placehold.co/300x300', hint: 'placeholder' },
      imageId: 'placeholder',
      isAvailable: true,
      isSpecial: false,
      isHotSelling: false,
    });
  };

  const handleDelete = (itemId: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== itemId));
    toast({
      title: 'Item Deleted',
      description: 'The menu item has been successfully removed.',
    });
  };

  const handleSave = () => {
    if (isEditing) {
      setMenuItems(menuItems.map((item) => (item.id === isEditing.id ? { ...item, ...editedItem } as MenuItem : item)));
      toast({ title: 'Item Updated' });
    } else if (isCreating) {
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        image: editedItem.image || { url: 'https://placehold.co/300x300', hint: 'placeholder' },
        ...editedItem,
      } as MenuItem;
      setMenuItems([...menuItems, newItem]);
      toast({ title: 'Item Created' });
    }
    setIsEditing(null);
    setIsCreating(false);
    setEditedItem({});
  };

  const handleToggle = (itemId: string, field: 'isAvailable' | 'isSpecial' | 'isHotSelling') => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === itemId ? { ...item, [field]: !item[field] } : item
      )
    );
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedItem({ ...editedItem, image: { url: reader.result as string, hint: 'custom upload' } });
      };
      reader.readAsDataURL(file);
    }
  };


  const renderEditDialog = () => (
    <Dialog open={!!isEditing || isCreating} onOpenChange={(isOpen) => { if (!isOpen) { setIsEditing(null); setIsCreating(null); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Menu Item' : 'Create New Item'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={editedItem.name || ''} onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Input id="description" value={editedItem.description || ''} onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price</Label>
            <Input id="price" type="number" value={editedItem.price || ''} onChange={(e) => setEditedItem({ ...editedItem, price: parseFloat(e.target.value) || 0 })} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Input id="category" value={editedItem.category || ''} onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Image</Label>
            <Input id="image" type="file" onChange={handleImageChange} className="col-span-3" accept="image/*" />
          </div>
          {editedItem.image?.url && (
            <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3">
                    <p className="text-sm font-medium mb-2">Image Preview:</p>
                    <Image src={editedItem.image.url} alt="Preview" width={100} height={100} className="rounded-md object-cover" />
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      {renderEditDialog()}
      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
          <CardDescription>Manage the tax rate for all orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="tax-rate"
                type="number"
                value={localTaxRate}
                onChange={handleTaxRateChange}
                placeholder="e.g., 8"
              />
              <Button onClick={handleSaveTaxRate}>Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>
                    Manage your restaurant's menu items.
                </CardDescription>
            </div>
            <Button onClick={handleCreateClick}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Special</TableHead>
                <TableHead>Hot Selling</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => handleToggle(item.id, 'isAvailable')}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isSpecial}
                      onCheckedChange={() => handleToggle(item.id, 'isSpecial')}
                    />
                  </TableCell>
                   <TableCell>
                    <Switch
                      checked={item.isHotSelling}
                      onCheckedChange={() => handleToggle(item.id, 'isHotSelling')}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
