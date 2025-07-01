import { SearchableItemSelect } from "./SearchableItemSelect";

interface ItemSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ItemSelect = ({ value, onChange, disabled = false }: ItemSelectProps) => {
  return <SearchableItemSelect value={value} onChange={onChange} disabled={disabled} />;
};
