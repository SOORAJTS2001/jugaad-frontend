
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {useAuth} from "@/hooks/useAuth.tsx";

interface AlertFormData {
  url: string;
  minPrice:number;
  maxPrice: number;
  minOffer: number;
  maxOffer: number;
  notes: string;
}

const AlertForm = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<AlertFormData>({
    url: '',
    minPrice: 0,
    maxPrice: 0,
    minOffer: 0,
    maxOffer: 0,
    notes: ''
  });

  const handleInputChange = (field: keyof AlertFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Dummy backend call simulation
      const data = {
        uid: user.uid,
        email: user.email,
        username: user.displayName,
        url: formData.url,
        min_price: formData.minPrice,
        max_price: formData.maxPrice,
        min_offer: formData.minOffer,
        max_offer: formData.maxOffer,
        notes: formData.notes,
        pincode: "682020"
        // You might want to add other relevant user data here
      };

      // Make the backend POST call
      const response = await fetch('https:/jugaad-backend-production.up.railway.app/add-items', { // Replace with your actual backend endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log('Alert created:', response);
      toast({
        title: "Alert Created Successfully!",
        description: "You'll be notified when price conditions are met.",
      });
      // Reset form and close dialog
      setFormData({
        url: '',
        minPrice: 0,
        maxPrice: 0,
        minOffer: 0,
        maxOffer: 0,
        notes: ''
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            Set up price monitoring for products from e-commerce sites like JioMart.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">Product URL *</Label>
              <Input
                id="url"
                placeholder="https://www.jiomart.com/product/..."
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Min Price (₹)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={formData.minPrice}
                  onChange={(e) => handleInputChange('minPrice', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price (₹)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="1000"
                  value={formData.maxPrice}
                  onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOffer">Min Offer (%)</Label>
                <Input
                  id="minOffer"
                  type="number"
                  placeholder="10"
                  value={formData.minOffer}
                  onChange={(e) => handleInputChange('minOffer', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOffer">Max Offer (%)</Label>
                <Input
                  id="maxOffer"
                  type="number"
                  placeholder="70"
                  value={formData.maxOffer}
                  onChange={(e) => handleInputChange('maxOffer', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this alert..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.url}>
              {isSubmitting ? 'Creating...' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AlertForm;
