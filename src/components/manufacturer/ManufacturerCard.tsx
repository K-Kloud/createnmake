import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail, ExternalLink, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

interface ManufacturerCardProps {
  id: string;
  name: string;
  type: string;
  description: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  portfolioCount?: number;
  specialties?: string[];
  verified?: boolean;
  phone?: string;
  email?: string;
  website?: string;
}

export const ManufacturerCard = ({
  id,
  name,
  type,
  description,
  location,
  rating = 0,
  reviewCount = 0,
  portfolioCount = 0,
  specialties = [],
  verified = false,
  phone,
  email,
  website
}: ManufacturerCardProps) => {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-200 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{name}</h3>
              {verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{type}</p>
          </div>
          
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-sm text-muted-foreground">
                {rating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm line-clamp-3">{description}</p>

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{specialties.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{portfolioCount} portfolio items</span>
          <span>{reviewCount} reviews</span>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-3 text-sm">
          {phone && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </div>
          )}
          {website && (
            <a 
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link to={`/maker/${id}?type=manufacturer`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
          <Link to={`/request-quote?manufacturer=${id}`} className="flex-1">
            <Button className="w-full">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Request Quote
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};