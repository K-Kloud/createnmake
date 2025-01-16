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
        <SelectContent className="max-h-[400px]">
          <SelectGroup>
            <SelectLabel>Men's Wear</SelectLabel>
            <SelectItem value="mens-formal-suit">Formal Suit</SelectItem>
            <SelectItem value="mens-tuxedo">Tuxedo</SelectItem>
            <SelectItem value="mens-dress-shirt">Dress Shirt</SelectItem>
            <SelectItem value="mens-waistcoat">Waistcoat</SelectItem>
            <SelectItem value="mens-casual-shirt">Casual Shirt</SelectItem>
            <SelectItem value="mens-jeans">Jeans</SelectItem>
            <SelectItem value="mens-chinos">Chinos</SelectItem>
            <SelectItem value="mens-hoodie">Hoodie</SelectItem>
            <SelectItem value="mens-dashiki">Dashiki</SelectItem>
            <SelectItem value="mens-agbada">Agbada</SelectItem>
            <SelectItem value="mens-kaftan">Kaftan</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Women's Wear</SelectLabel>
            <SelectItem value="womens-formal-dress">Formal Dress</SelectItem>
            <SelectItem value="womens-gown">Evening Gown</SelectItem>
            <SelectItem value="womens-blouse">Blouse</SelectItem>
            <SelectItem value="womens-pencil-skirt">Pencil Skirt</SelectItem>
            <SelectItem value="womens-casual-dress">Casual Dress</SelectItem>
            <SelectItem value="womens-maxi-dress">Maxi Dress</SelectItem>
            <SelectItem value="womens-iro-buba">Iro and Buba</SelectItem>
            <SelectItem value="womens-wrapper">Traditional Wrapper</SelectItem>
            <SelectItem value="womens-blazer">Blazer</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Children's Wear</SelectLabel>
            <SelectItem value="kids-casual">Casual Wear</SelectItem>
            <SelectItem value="kids-uniform">School Uniform</SelectItem>
            <SelectItem value="kids-traditional">Traditional Attire</SelectItem>
            <SelectItem value="kids-party">Party Wear</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Traditional African Styles</SelectLabel>
            <SelectItem value="african-kente">Kente Cloth</SelectItem>
            <SelectItem value="african-fugu">Fugu Smock</SelectItem>
            <SelectItem value="african-boubou">Boubou</SelectItem>
            <SelectItem value="african-kitenge">Kitenge</SelectItem>
            <SelectItem value="african-shuka">Maasai Shuka</SelectItem>
            <SelectItem value="african-djellaba">Djellaba</SelectItem>
            <SelectItem value="african-kaftan">Kaftan</SelectItem>
            <SelectItem value="african-aso-ebi">Aso Ebi</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Contemporary African</SelectLabel>
            <SelectItem value="modern-ankara-jacket">Ankara Jacket</SelectItem>
            <SelectItem value="modern-african-jumpsuit">African Print Jumpsuit</SelectItem>
            <SelectItem value="modern-streetwear">African Streetwear</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Footwear</SelectLabel>
            <SelectItem value="dress-shoes">Dress Shoes</SelectItem>
            <SelectItem value="boots">Boots</SelectItem>
            <SelectItem value="sneakers">Sneakers</SelectItem>
            <SelectItem value="sandals">Sandals</SelectItem>
            <SelectItem value="loafers">Loafers</SelectItem>
            <SelectItem value="heels">Heels</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Accessories</SelectLabel>
            <SelectItem value="hat">Hat</SelectItem>
            <SelectItem value="scarf">Scarf</SelectItem>
            <SelectItem value="tie">Tie</SelectItem>
            <SelectItem value="belt">Belt</SelectItem>
            <SelectItem value="jewelry">Jewelry</SelectItem>
            <SelectItem value="handbag">Handbag</SelectItem>
            <SelectItem value="backpack">Backpack</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>Home & Decor</SelectLabel>
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
        </SelectContent>
      </Select>
    </div>
  );
};