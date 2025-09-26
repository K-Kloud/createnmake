-- Add sample test orders using existing profile structure and hardcoded user ID
-- The user ID from the logs shows '7bba845e-70af-4f2e-ba5c-3b8ae9b757f6' so we'll use that
INSERT INTO artisan_quotes (
  user_id,
  product_details,
  materials,
  colors,
  budget_range,
  amount,
  quantity,
  timeline_days,
  status,
  dimensions,
  special_requirements,
  delivery_address,
  contact_preferences
) VALUES 
(
  '7bba845e-70af-4f2e-ba5c-3b8ae9b757f6',
  'Custom Hand-Knitted Wool Scarf with Traditional Nigerian Patterns',
  'Premium Merino Wool, Natural Dyes',
  'Deep Blue, Gold, Traditional Indigo',
  '$150-250',
  200.00,
  1,
  14,
  'pending',
  '200cm x 30cm',
  'Traditional Adire patterns, hand-finished edges',
  '123 Main St, Lagos, Nigeria',
  'WhatsApp or Email'
),
(
  '7bba845e-70af-4f2e-ba5c-3b8ae9b757f6',
  'Handcrafted Leather Handbag with Brass Fittings',
  'Full-grain Nigerian Leather, Brass Hardware',
  'Rich Brown, Brass Accents',
  '$300-500',
  425.00,
  1,
  21,
  'in_progress',
  '35cm x 25cm x 15cm',
  'Interior pockets, adjustable strap, hand-stitched',
  '123 Main St, Lagos, Nigeria',
  'Phone or Email'
),
(
  '7bba845e-70af-4f2e-ba5c-3b8ae9b757f6',
  'Traditional Carved Wooden Stool (Igbo Style)',
  'Mahogany Wood, Natural Finish',
  'Natural Wood Tone',
  '$100-200',
  150.00,
  2,
  10,
  'completed',
  '40cm x 40cm x 45cm',
  'Traditional Igbo carvings, smooth finish',
  '123 Main St, Lagos, Nigeria',
  'WhatsApp'
);

-- Add manufacturer quote requests
INSERT INTO quote_requests (
  user_id,
  product_details,
  materials,
  colors,
  budget_range,
  amount,
  quantity,
  timeline_days,
  status,
  dimensions,
  special_requirements,
  delivery_address,
  contact_preferences
) VALUES 
(
  '7bba845e-70af-4f2e-ba5c-3b8ae9b757f6',
  'Custom Ankara Print T-Shirts for Corporate Event',
  '100% Cotton, Ankara Print Fabric',
  'Vibrant Multi-color Ankara Pattern',
  '$500-1000',
  750.00,
  25,
  15,
  'pending',
  'Various Sizes (S-XXL)',
  'Corporate logo embroidery, size variety pack',
  '456 Business District, Abuja, Nigeria',
  'Email and Phone'
),
(
  '7bba845e-70af-4f2e-ba5c-3b8ae9b757f6',
  'Modern Nigerian Wedding Attire Set',
  'Premium Lace, Gele Fabric, Aso-oke',
  'Gold and Royal Blue',
  '$800-1200',
  950.00,
  1,
  30,
  'in_progress',
  'Custom measurements provided',
  'Traditional cuts with modern styling, complete set',
  '789 Wedding Ave, Port Harcourt, Nigeria',
  'WhatsApp preferred'
),
(
  '7bba845e-70af-4f2e-ba5c-3b8ae9b757f6',
  'Sustainable Fashion Line - 10 Piece Collection',
  'Organic Cotton, Recycled Polyester',
  'Earth Tones, Natural Dyes',
  '$2000-3000',
  2500.00,
  10,
  45,
  'review',
  'Mixed sizes and styles',
  'Eco-friendly packaging, sustainable production methods',
  '321 Green Street, Kano, Nigeria',
  'Email for detailed discussions'
);