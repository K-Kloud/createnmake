import { Card } from "@/components/ui/card";

interface Manufacturer {
  business_name: string;
  business_type: string;
  contact_email: string;
  phone: string | null;
  address: string | null;
  specialties: string[] | null;
}

interface ManufacturerOverviewProps {
  manufacturer: Manufacturer | null;
}

export const ManufacturerOverview = ({ manufacturer }: ManufacturerOverviewProps) => {
  if (!manufacturer) return null;

  return (
    <div className="glass-card p-6">
      <h2 className="text-2xl font-semibold mb-4">{manufacturer.business_name}</h2>
      <div className="grid gap-4">
        <p><strong>Type:</strong> {manufacturer.business_type}</p>
        <p><strong>Email:</strong> {manufacturer.contact_email}</p>
        <p><strong>Phone:</strong> {manufacturer.phone}</p>
        <p><strong>Address:</strong> {manufacturer.address}</p>
        <div>
          <strong>Specialties:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {manufacturer.specialties?.map((specialty: string) => (
              <span
                key={specialty}
                className="px-2 py-1 text-sm rounded-full bg-primary/10 text-primary"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};