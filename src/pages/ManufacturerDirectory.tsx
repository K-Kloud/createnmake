import { ManufacturerDirectory } from "@/components/manufacturer/ManufacturerDirectory";
import { SEO } from "@/components/SEO";

const ManufacturerDirectoryPage = () => {
  return (
    <>
      <SEO 
        title="Manufacturer Directory - Find Skilled Manufacturers"
        description="Browse our directory of verified manufacturers. Search by location, specialty, and rating to find the perfect manufacturer for your project."
        keywords={["manufacturers", "directory", "custom manufacturing", "production", "craftspeople", "makers"]}
      />
      <ManufacturerDirectory />
    </>
  );
};

export default ManufacturerDirectoryPage;