-- Convert generated images to portfolio items
INSERT INTO artisan_portfolio (
  artisan_id,
  title,
  description,
  image_url,
  project_type,
  materials_used,
  display_order,
  is_featured,
  is_public,
  created_at
)
SELECT 
  '69b8cdd3-e05b-41de-a6fa-ffc2103347e3' as artisan_id,
  CASE 
    WHEN item_type = 'ankara-maxi-gown' THEN 'Ankara Print Fashion Design'
    WHEN item_type = 'fitted-agbada' THEN 'Contemporary Fitted Agbada'
    WHEN item_type = 'ankara-print-jumpsuit' THEN 'Ankara Print Outfit'
    WHEN item_type = 'mens-senator-wear-kaftan' THEN 'Senator Wear Design'
    WHEN item_type = 'tops' THEN 'Ankara Blazer Street Style'
    WHEN item_type = 'outerwear' THEN 'Oversized Denim Outerwear'
    WHEN item_type = 'dresses' THEN 'Green Lace Maxi Dress'
    ELSE 'Custom Design Project'
  END as title,
  prompt as description,
  image_url,
  CASE 
    WHEN item_type LIKE '%agbada%' OR item_type LIKE '%senator%' THEN 'Traditional Nigerian Fashion'
    WHEN item_type LIKE '%ankara%' THEN 'Ankara Print Design'
    WHEN item_type = 'outerwear' THEN 'Contemporary Outerwear'
    WHEN item_type = 'dresses' THEN 'Formal Wear'
    WHEN item_type = 'tops' THEN 'Casual Fashion'
    ELSE 'Fashion Design'
  END as project_type,
  ARRAY[
    CASE 
      WHEN item_type LIKE '%ankara%' THEN 'African Print Fabric'
      WHEN item_type LIKE '%agbada%' THEN 'Traditional Fabric'
      WHEN item_type LIKE '%lace%' THEN 'Lace Material'
      WHEN item_type = 'outerwear' THEN 'Denim'
      ELSE 'Premium Fabric'
    END,
    'Custom Tailoring',
    'Hand-finished Details'
  ] as materials_used,
  (ROW_NUMBER() OVER (ORDER BY created_at DESC))::integer + 10 as display_order,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY created_at DESC) <= 2 THEN true ELSE false END as is_featured,
  true as is_public,
  created_at
FROM generated_images 
WHERE user_id = '69b8cdd3-e05b-41de-a6fa-ffc2103347e3'
  AND is_public = true
  AND id NOT IN (
    -- Avoid duplicates if already converted
    SELECT CAST(SPLIT_PART(ap.description, 'Image ID:', 2) AS bigint)
    FROM artisan_portfolio ap
    WHERE ap.artisan_id = '69b8cdd3-e05b-41de-a6fa-ffc2103347e3'
      AND ap.description LIKE '%Image ID:%'
  )
ORDER BY created_at DESC
LIMIT 10;