import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const ItemSelect = ({ value, onChange }: ItemSelectProps) => {
  return (
    <div className="space-y-2">
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="w-full bg-card/30 border-white/10">
          <SelectValue placeholder="Select what you want to create" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tailor Items</SelectLabel>
            <SelectItem value="suit">Suit</SelectItem>
            <SelectItem value="dress-shirt">Dress Shirt</SelectItem>
            <SelectItem value="trousers">Trousers</SelectItem>
            <SelectItem value="dress">Dress</SelectItem>
            <SelectItem value="blazer">Blazer</SelectItem>
            <SelectItem value="waistcoat">Waistcoat</SelectItem>
            <SelectItem value="skirt">Skirt</SelectItem>
            <SelectItem value="coat">Coat</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Cobbler Items</SelectLabel>
            <SelectItem value="dress-shoes">Dress Shoes</SelectItem>
            <SelectItem value="boots">Boots</SelectItem>
            <SelectItem value="sneakers">Sneakers</SelectItem>
            <SelectItem value="sandals">Sandals</SelectItem>
            <SelectItem value="loafers">Loafers</SelectItem>
            <SelectItem value="oxford-shoes">Oxford Shoes</SelectItem>
            <SelectItem value="heels">Heels</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Leather Goods</SelectLabel>
            <SelectItem value="leather-bag">Leather Bag</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
            <SelectItem value="belt">Belt</SelectItem>
            <SelectItem value="briefcase">Briefcase</SelectItem>
            <SelectItem value="backpack">Backpack</SelectItem>
            <SelectItem value="messenger-bag">Messenger Bag</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Accessories</SelectLabel>
            <SelectItem value="tie">Tie</SelectItem>
            <SelectItem value="bow-tie">Bow Tie</SelectItem>
            <SelectItem value="scarf">Scarf</SelectItem>
            <SelectItem value="gloves">Gloves</SelectItem>
            <SelectItem value="hat">Hat</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};