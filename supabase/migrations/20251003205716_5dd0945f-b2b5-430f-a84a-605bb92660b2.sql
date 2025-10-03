-- Insert sample portfolio items for artisan
INSERT INTO artisan_portfolio (
  artisan_id,
  title,
  description,
  image_url,
  project_type,
  materials_used,
  completion_date,
  client_name,
  project_value,
  display_order,
  is_featured,
  is_public
) VALUES
(
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  'Custom Leather Jacket',
  'Hand-crafted premium leather jacket with brass hardware and custom embroidery. Made from full-grain Italian leather with silk lining.',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
  'Leather Work',
  ARRAY['Full-grain leather', 'Brass hardware', 'Silk lining', 'Waxed thread'],
  '2024-01-15',
  'Fashion House Ltd',
  850.00,
  1,
  true,
  true
),
(
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  'Artisan Leather Bag',
  'Handmade messenger bag with adjustable strap and multiple compartments. Features hand-stitched details and antique brass buckles.',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop',
  'Bag Making',
  ARRAY['Vegetable-tanned leather', 'Canvas lining', 'Antique brass buckles'],
  '2024-02-20',
  'Private Client',
  420.00,
  2,
  true,
  true
),
(
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  'Custom Boots',
  'Bespoke Chelsea boots with elastic gussets. Constructed using traditional Goodyear welt technique for durability and elegance.',
  'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=600&fit=crop',
  'Footwear',
  ARRAY['Premium calfskin', 'Leather sole', 'Elastic gusset'],
  '2024-03-10',
  'John Anderson',
  650.00,
  3,
  false,
  true
),
(
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  'Leather Watch Strap',
  'Handcrafted watch strap with contrast stitching and quick-release spring bars. Available in various colors and finishes.',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop',
  'Accessories',
  ARRAY['Chrome-tanned leather', 'Waxed thread', 'Stainless steel hardware'],
  '2024-02-28',
  'Watch Boutique',
  95.00,
  4,
  false,
  true
);

-- Insert sample make requests (artisan_quotes)
INSERT INTO artisan_quotes (
  artisan_id,
  user_id,
  product_details,
  status,
  dimensions,
  materials,
  colors,
  quantity,
  timeline_days,
  budget_range,
  special_requirements,
  delivery_address,
  generated_image_url
) VALUES
(
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3', -- using same ID as placeholder user
  'Custom leather wallet with embossed initials and coin pocket',
  'pending',
  '10cm x 8cm x 2cm',
  'Full-grain leather, brass snap',
  'Dark brown, gold accents',
  1,
  14,
  '£100-£200',
  'Would like initials "JD" embossed on front',
  'London, UK',
  'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop'
),
(
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  'Leather laptop sleeve with zipper closure',
  'quoted',
  '35cm x 25cm x 2cm',
  'Vegetable-tanned leather',
  'Natural tan',
  1,
  21,
  '£150-£250',
  'Must fit 14-inch laptop securely',
  'Manchester, UK',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
),
(
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3',
  'Set of 4 leather coasters with holder',
  'completed',
  '10cm x 10cm per coaster',
  'Premium leather scraps, felt backing',
  'Mixed earth tones',
  4,
  7,
  '£50-£100',
  'Gift set packaging preferred',
  'Birmingham, UK',
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop'
);