import { manufacturers } from "@/data/manufacturers";
import { ManufacturerCard } from "./ManufacturerCard";

export const ManufacturerList = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">All Manufacturers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {manufacturers.map((manufacturer) => (
          <ManufacturerCard
            key={manufacturer.id}
            {...manufacturer}
          />
        ))}
      </div>
    </div>
  );
};