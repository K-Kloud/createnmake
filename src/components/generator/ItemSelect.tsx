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
            <SelectLabel>Furniture</SelectLabel>
            <SelectItem value="dining-table">Dining Table</SelectItem>
            <SelectItem value="coffee-table">Coffee Table</SelectItem>
            <SelectItem value="bed-frame">Bed Frame</SelectItem>
            <SelectItem value="bookshelf">Bookshelf</SelectItem>
            <SelectItem value="cabinet">Cabinet</SelectItem>
            <SelectItem value="chair">Chair</SelectItem>
            <SelectItem value="bench">Bench</SelectItem>
            <SelectItem value="side-table">Side Table</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Home Textiles</SelectLabel>
            <SelectItem value="quilt">Quilt</SelectItem>
            <SelectItem value="duvet-cover">Duvet Cover</SelectItem>
            <SelectItem value="throw-pillow">Throw Pillow</SelectItem>
            <SelectItem value="curtains">Curtains</SelectItem>
            <SelectItem value="table-runner">Table Runner</SelectItem>
            <SelectItem value="area-rug">Area Rug</SelectItem>
            <SelectItem value="tapestry">Tapestry</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Decor & Accessories</SelectLabel>
            <SelectItem value="wall-art">Wall Art</SelectItem>
            <SelectItem value="ceramic-vase">Ceramic Vase</SelectItem>
            <SelectItem value="decorative-bowl">Decorative Bowl</SelectItem>
            <SelectItem value="candle-holder">Candle Holder</SelectItem>
            <SelectItem value="mirror-frame">Mirror Frame</SelectItem>
            <SelectItem value="lamp">Lamp</SelectItem>
            <SelectItem value="basket">Basket</SelectItem>
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