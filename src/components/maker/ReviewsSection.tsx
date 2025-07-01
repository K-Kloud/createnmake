
interface Review {
  id: number;
  rating: number;
  comment: string;
  date: string;
  user: string;
}

interface ReviewsSectionProps {
  reviews?: Review[];
}

export const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{review.user}</h3>
                <span className="text-sm text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex items-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No reviews yet.</p>
      )}
    </div>
  );
};
