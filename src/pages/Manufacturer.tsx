import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ManufacturerCard } from "@/components/manufacturer/ManufacturerCard";

const manufacturers = [
  {
    id: 1,
    name: "Elite Tailors & Co.",
    type: "Tailor",
    description: "Specializing in bespoke suits and custom alterations with over 20 years of experience.",
    rating: 4.8,
    reviews: [
      {
        id: 1,
        user: "James Wilson",
        rating: 5,
        comment: "Exceptional attention to detail. My suit fits perfectly!",
        date: "2024-02-15"
      },
      {
        id: 2,
        user: "Sarah Chen",
        rating: 4,
        comment: "Great service, though slightly longer wait times than expected.",
        date: "2024-02-10"
      }
    ],
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
    location: "London, UK",
    specialties: ["Bespoke Suits", "Wedding Attire", "Alterations"]
  },
  {
    id: 2,
    name: "Artisan Cobblers",
    type: "Cobbler",
    description: "Traditional shoe crafting and repair services using premium materials.",
    rating: 4.6,
    reviews: [
      {
        id: 3,
        user: "Michael Brown",
        rating: 5,
        comment: "Brought my old boots back to life. Amazing craftsmanship!",
        date: "2024-02-14"
      },
      {
        id: 4,
        user: "Emma Davis",
        rating: 4,
        comment: "Quality work on my designer shoes. Will return!",
        date: "2024-02-08"
      }
    ],
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4",
    location: "Milan, Italy",
    specialties: ["Shoe Repair", "Custom Shoes", "Leather Work"]
  },
  {
    id: 3,
    name: "Digital Print Masters",
    type: "Printer",
    description: "High-quality digital and offset printing services for all your needs.",
    rating: 4.7,
    reviews: [
      {
        id: 5,
        user: "Lisa Zhang",
        rating: 5,
        comment: "Excellent print quality and fast turnaround!",
        date: "2024-02-13"
      },
      {
        id: 6,
        user: "Tom Harris",
        rating: 4,
        comment: "Professional service and great communication.",
        date: "2024-02-07"
      }
    ],
    image: "https://images.unsplash.com/photo-1562408590-e32931084e23",
    location: "New York, USA",
    specialties: ["Large Format", "Business Cards", "Custom Packaging"]
  },
  {
    id: 4,
    name: "Golden Touch Jewelers",
    type: "Goldsmith",
    description: "Creating unique, handcrafted jewelry pieces and custom designs.",
    rating: 4.9,
    reviews: [
      {
        id: 7,
        user: "Rachel Green",
        rating: 5,
        comment: "Created the perfect engagement ring. Absolutely stunning!",
        date: "2024-02-12"
      },
      {
        id: 8,
        user: "David Kim",
        rating: 5,
        comment: "Exceptional craftsmanship and attention to detail.",
        date: "2024-02-06"
      }
    ],
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
    location: "Paris, France",
    specialties: ["Custom Jewelry", "Repairs", "Stone Setting"]
  },
  {
    id: 5,
    name: "Luxury Leather Works",
    type: "Bag Maker",
    description: "Handcrafted leather bags and accessories using premium materials.",
    rating: 4.7,
    reviews: [
      {
        id: 9,
        user: "Sophie Turner",
        rating: 5,
        comment: "My custom bag is absolutely perfect! Worth every penny.",
        date: "2024-02-11"
      },
      {
        id: 10,
        user: "Alex Johnson",
        rating: 4,
        comment: "Beautiful craftsmanship, though longer wait times.",
        date: "2024-02-05"
      }
    ],
    image: "https://images.unsplash.com/photo-1473188588951-666fce8e7c68",
    location: "Florence, Italy",
    specialties: ["Custom Bags", "Leather Goods", "Repairs"]
  },
  {
    id: 6,
    name: "Artisan Furniture Makers",
    type: "Furniture",
    description: "Custom-made furniture crafted with sustainable materials and traditional techniques.",
    rating: 4.8,
    reviews: [
      {
        id: 11,
        user: "Chris Martin",
        rating: 5,
        comment: "The dining table they made is a masterpiece!",
        date: "2024-02-09"
      },
      {
        id: 12,
        user: "Julia Roberts",
        rating: 4,
        comment: "Beautiful work, great attention to detail.",
        date: "2024-02-04"
      }
    ],
    image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103",
    location: "Copenhagen, Denmark",
    specialties: ["Custom Furniture", "Restoration", "Wood Carving"]
  }
];

const Manufacturer = () => {
  const selectedImage = localStorage.getItem('selectedManufacturerImage');
  const imageDetails = selectedImage ? JSON.parse(selectedImage) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-24">
        <h1 className="text-4xl font-bold mb-8 gradient-text">
          Our Manufacturers
        </h1>
        
        {imageDetails && (
          <div className="mb-8 p-4 glass-card">
            <h2 className="text-xl font-semibold mb-4">Selected Design</h2>
            <div className="flex items-center gap-4">
              <img
                src={imageDetails.url}
                alt={imageDetails.prompt}
                className="w-32 h-32 object-cover rounded"
              />
              <div>
                <p className="text-sm text-muted-foreground">Design ID: {imageDetails.id}</p>
                <p className="mt-2">{imageDetails.prompt}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {manufacturers.map((manufacturer) => (
            <ManufacturerCard
              key={manufacturer.id}
              {...manufacturer}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Manufacturer;