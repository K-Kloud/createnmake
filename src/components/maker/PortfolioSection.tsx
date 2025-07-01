
interface PortfolioItem {
  id: number;
  generatedImage: string;
  productImage: string;
  description: string;
}

interface PortfolioSectionProps {
  portfolioItems?: PortfolioItem[];
}

export const PortfolioSection = ({ portfolioItems }: PortfolioSectionProps) => {
  if (!portfolioItems || portfolioItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map(item => (
          <div key={item.id} className="rounded-lg overflow-hidden border">
            <div className="grid grid-cols-2 gap-2 p-2">
              <img
                src={item.generatedImage}
                alt="Design"
                className="w-full h-32 object-cover rounded"
              />
              <img
                src={item.productImage}
                alt="Product"
                className="w-full h-32 object-cover rounded"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-center">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
