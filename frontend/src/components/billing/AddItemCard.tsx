import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddItemCardProps {
  newItem: {
    medicineName: string;
    phoneNumber: string;
    quantity: number;
  };
  setNewItem: (item: any) => void;
  handleAddItem: () => void;
  sampleMedicines: any[];
}

export function AddItemCard({ newItem, setNewItem, handleAddItem, sampleMedicines }: AddItemCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Add Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="medicine">Medicine</Label>
          <Select
            value={newItem.medicineName}
            onValueChange={(value) => setNewItem({ ...newItem, medicineName: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select medicine" />
            </SelectTrigger>
            <SelectContent>
              {sampleMedicines.map((med) => (
                <SelectItem key={med.name} value={med.name}>
                  {med.name} (₹{med.price.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Customer phone number"
            value={newItem.phoneNumber}
            onChange={(e) => setNewItem({ ...newItem, phoneNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAddItem} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </CardFooter>
    </Card>
  );
}