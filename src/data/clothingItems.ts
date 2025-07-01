
// Comprehensive clothing items database with hierarchical organization
export interface ClothingItem {
  value: string;
  label: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  description?: string;
}

export const clothingCategories = {
  tops: "Tops",
  bottoms: "Bottoms", 
  dresses: "Dresses",
  outerwear: "Outerwear",
  suits: "Suits & Formal Wear",
  jumpsuits: "Jumpsuits & Rompers",
  activewear: "Activewear",
  shoes: "Shoes",
  accessories: "Accessories",
  traditional: "Traditional Clothing",
  underwear: "Underwear & Loungewear",
  uniforms: "Uniforms & Workwear",
  styles: "Fashion Styles"
} as const;

export const clothingItems: ClothingItem[] = [
  // Tops
  { value: "basic-t-shirt-crew-neck", label: "Basic T-Shirt (Crew Neck)", category: "tops", subcategory: "t-shirts", keywords: ["basic", "crew neck", "cotton", "casual"], description: "Classic crew neck t-shirt" },
  { value: "v-neck-t-shirt", label: "V-Neck T-Shirt", category: "tops", subcategory: "t-shirts", keywords: ["v-neck", "casual", "cotton"] },
  { value: "long-sleeve-t-shirt", label: "Long-Sleeve T-Shirt", category: "tops", subcategory: "t-shirts", keywords: ["long sleeve", "layering", "casual"] },
  { value: "tank-top", label: "Tank Top", category: "tops", subcategory: "t-shirts", keywords: ["sleeveless", "summer", "athletic"] },
  { value: "crop-top", label: "Crop Top", category: "tops", subcategory: "t-shirts", keywords: ["cropped", "trendy", "summer"] },
  { value: "blouse-silk", label: "Blouse (Silk)", category: "tops", subcategory: "blouses", keywords: ["silk", "elegant", "formal", "flowing"] },
  { value: "button-down-shirt-oxford", label: "Button-Down Shirt (Oxford)", category: "tops", subcategory: "shirts", keywords: ["oxford", "formal", "business", "cotton"] },
  { value: "tunic", label: "Tunic", category: "tops", subcategory: "blouses", keywords: ["loose", "comfortable", "bohemian"] },
  { value: "sweater-crew-neck-wool", label: "Sweater (Crew Neck Wool)", category: "tops", subcategory: "sweaters", keywords: ["wool", "warm", "chunky knit"] },
  { value: "cardigan-button-up", label: "Cardigan (Button-Up)", category: "tops", subcategory: "sweaters", keywords: ["layering", "button-up", "cozy"] },
  { value: "hoodie-pullover", label: "Hoodie (Pullover)", category: "tops", subcategory: "hoodies", keywords: ["casual", "comfortable", "drawstring"] },
  { value: "zip-up-hoodie", label: "Zip-Up Hoodie", category: "tops", subcategory: "hoodies", keywords: ["zip", "layering", "athletic"] },
  { value: "polo-shirt", label: "Polo Shirt", category: "tops", subcategory: "shirts", keywords: ["collar", "casual", "sporty"] },
  { value: "peasant-top", label: "Peasant Top", category: "tops", subcategory: "blouses", keywords: ["bohemian", "embroidered", "flowing"] },
  { value: "camisole-lace-trim", label: "Camisole (Lace Trim)", category: "tops", subcategory: "camisoles", keywords: ["delicate", "lace", "layering"] },
  { value: "halter-top", label: "Halter Top", category: "tops", subcategory: "tops", keywords: ["backless", "summer", "strappy"] },
  { value: "off-the-shoulder-top", label: "Off-the-Shoulder Top", category: "tops", subcategory: "tops", keywords: ["shoulders", "romantic", "trendy"] },
  { value: "tube-top", label: "Tube Top", category: "tops", subcategory: "tops", keywords: ["strapless", "summer", "fitted"] },
  { value: "bodysuit-long-sleeve", label: "Bodysuit (Long Sleeve)", category: "tops", subcategory: "bodysuits", keywords: ["fitted", "sleek", "layering"] },
  { value: "kimono-top", label: "Kimono Top", category: "tops", subcategory: "tops", keywords: ["flowing", "wide sleeves", "oriental"] },
  { value: "henley-shirt-long-sleeve", label: "Henley Shirt (Long Sleeve)", category: "tops", subcategory: "shirts", keywords: ["buttons", "casual", "layering"] },
  { value: "flannel-shirt", label: "Flannel Shirt", category: "tops", subcategory: "shirts", keywords: ["plaid", "warm", "casual"] },
  { value: "chambray-shirt", label: "Chambray Shirt", category: "tops", subcategory: "shirts", keywords: ["denim-like", "casual", "lightweight"] },
  { value: "guayabera-shirt", label: "Guayabera Shirt", category: "tops", subcategory: "shirts", keywords: ["embroidered", "formal", "traditional"] },
  { value: "rugby-shirt", label: "Rugby Shirt", category: "tops", subcategory: "shirts", keywords: ["striped", "sporty", "durable"] },
  { value: "hawaiian-shirt", label: "Hawaiian Shirt", category: "tops", subcategory: "shirts", keywords: ["tropical", "vacation", "colorful"] },
  { value: "sweatshirt-crew-neck", label: "Sweatshirt (Crew Neck)", category: "tops", subcategory: "sweatshirts", keywords: ["fleece", "comfortable", "casual"] },
  { value: "baseball-tee-raglan", label: "Baseball Tee (Raglan)", category: "tops", subcategory: "t-shirts", keywords: ["raglan", "sporty", "contrasting"] },
  { value: "muscle-shirt", label: "Muscle Shirt", category: "tops", subcategory: "t-shirts", keywords: ["athletic", "fitted", "sleeveless"] },
  { value: "bowling-shirt", label: "Bowling Shirt", category: "tops", subcategory: "shirts", keywords: ["retro", "camp collar", "embroidered"] },
  { value: "turtleneck-sweater-cashmere", label: "Turtleneck Sweater (Cashmere)", category: "tops", subcategory: "sweaters", keywords: ["turtleneck", "luxury", "warm"] },
  { value: "mock-neck-sweater", label: "Mock Neck Sweater", category: "tops", subcategory: "sweaters", keywords: ["mock neck", "sophisticated", "layering"] },
  { value: "fair-isle-sweater", label: "Fair Isle Sweater", category: "tops", subcategory: "sweaters", keywords: ["patterned", "traditional", "colorful"] },
  { value: "aran-sweater-fisherman", label: "Aran Sweater (Fisherman Sweater)", category: "tops", subcategory: "sweaters", keywords: ["cable knit", "chunky", "traditional"] },
  { value: "mohair-sweater", label: "Mohair Sweater", category: "tops", subcategory: "sweaters", keywords: ["soft", "fuzzy", "textured"] },
  { value: "open-knit-sweater", label: "Open-Knit Sweater", category: "tops", subcategory: "sweaters", keywords: ["breathable", "loose knit", "layering"] },
  { value: "poncho-knit", label: "Poncho (Knit)", category: "tops", subcategory: "ponchos", keywords: ["flowing", "bohemian", "cozy"] },
  { value: "shrug-cropped-cardigan", label: "Shrug (Cropped Cardigan)", category: "tops", subcategory: "cardigans", keywords: ["cropped", "layering", "delicate"] },
  { value: "twin-set-cardigan-shell", label: "Twin Set (Cardigan & Shell Top)", category: "tops", subcategory: "sets", keywords: ["matching", "coordinated", "classic"] },
  { value: "cable-knit-vest", label: "Cable Knit Vest", category: "tops", subcategory: "vests", keywords: ["preppy", "layering", "textured"] },

  // Bottoms
  { value: "skinny-jeans", label: "Skinny Jeans", category: "bottoms", subcategory: "jeans", keywords: ["fitted", "stretchy", "modern"] },
  { value: "straight-leg-jeans", label: "Straight-Leg Jeans", category: "bottoms", subcategory: "jeans", keywords: ["classic", "versatile", "timeless"] },
  { value: "boyfriend-jeans", label: "Boyfriend Jeans", category: "bottoms", subcategory: "jeans", keywords: ["relaxed", "distressed", "casual"] },
  { value: "wide-leg-trousers", label: "Wide-Leg Trousers", category: "bottoms", subcategory: "trousers", keywords: ["flowing", "elegant", "comfortable"] },
  { value: "palazzo-pants", label: "Palazzo Pants", category: "bottoms", subcategory: "pants", keywords: ["wide", "flowing", "bohemian"] },
  { value: "leggings-athletic", label: "Leggings (Athletic)", category: "bottoms", subcategory: "leggings", keywords: ["stretchy", "athletic", "comfortable"] },
  { value: "culottes", label: "Culottes", category: "bottoms", subcategory: "pants", keywords: ["wide", "cropped", "flowing"] },
  { value: "capri-pants", label: "Capri Pants", category: "bottoms", subcategory: "pants", keywords: ["cropped", "summer", "casual"] },
  { value: "cargo-pants-utility", label: "Cargo Pants (Utility)", category: "bottoms", subcategory: "pants", keywords: ["pockets", "utility", "casual"] },
  { value: "chinos-slim-fit", label: "Chinos (Slim Fit)", category: "bottoms", subcategory: "chinos", keywords: ["smart casual", "tailored", "versatile"] },
  { value: "sweatpants-joggers", label: "Sweatpants (Joggers)", category: "bottoms", subcategory: "sweatpants", keywords: ["comfortable", "athletic", "casual"] },
  { value: "yoga-pants-flared", label: "Yoga Pants (Flared)", category: "bottoms", subcategory: "activewear", keywords: ["stretchy", "comfortable", "flared"] },
  { value: "bike-shorts", label: "Bike Shorts", category: "bottoms", subcategory: "shorts", keywords: ["fitted", "athletic", "cycling"] },
  { value: "denim-shorts-cut-off", label: "Denim Shorts (Cut-Off)", category: "bottoms", subcategory: "shorts", keywords: ["casual", "frayed", "summer"] },
  { value: "bermuda-shorts", label: "Bermuda Shorts", category: "bottoms", subcategory: "shorts", keywords: ["knee-length", "tailored", "smart casual"] },
  { value: "leather-pants-skinny", label: "Leather Pants (Skinny)", category: "bottoms", subcategory: "pants", keywords: ["edgy", "fitted", "trendy"] },
  { value: "corduroy-pants", label: "Corduroy Pants", category: "bottoms", subcategory: "pants", keywords: ["textured", "retro", "warm"] },
  { value: "track-pants-retro", label: "Track Pants (Retro)", category: "bottoms", subcategory: "athletic", keywords: ["sporty", "striped", "retro"] },
  { value: "harem-pants", label: "Harem Pants", category: "bottoms", subcategory: "pants", keywords: ["dropped crotch", "bohemian", "comfortable"] },
  { value: "sailor-pants", label: "Sailor Pants", category: "bottoms", subcategory: "pants", keywords: ["nautical", "wide leg", "buttons"] },
  { value: "dress-trousers-wool", label: "Dress Trousers (Wool)", category: "bottoms", subcategory: "trousers", keywords: ["formal", "tailored", "business"] },
  { value: "khaki-shorts", label: "Khaki Shorts", category: "bottoms", subcategory: "shorts", keywords: ["casual", "classic", "versatile"] },
  { value: "cargo-shorts", label: "Cargo Shorts", category: "bottoms", subcategory: "shorts", keywords: ["pockets", "utility", "casual"] },
  { value: "board-shorts", label: "Board Shorts", category: "bottoms", subcategory: "swimwear", keywords: ["surfing", "quick-dry", "athletic"] },
  { value: "jean-shorts-mens", label: "Jean Shorts (Men's)", category: "bottoms", subcategory: "shorts", keywords: ["denim", "casual", "classic"] },
  { value: "pajama-pants", label: "Pajama Pants", category: "bottoms", subcategory: "sleepwear", keywords: ["comfortable", "soft", "loungewear"] },
  { value: "overalls-denim", label: "Overalls (Denim)", category: "bottoms", subcategory: "overalls", keywords: ["workwear", "vintage", "casual"] },
  { value: "work-pants-canvas", label: "Work Pants (Canvas)", category: "bottoms", subcategory: "workwear", keywords: ["durable", "reinforced", "utility"] },
  { value: "athletic-shorts-running", label: "Athletic Shorts (Running)", category: "bottoms", subcategory: "activewear", keywords: ["athletic", "lightweight", "moisture-wicking"] },
  { value: "sweat-shorts", label: "Sweat Shorts", category: "bottoms", subcategory: "shorts", keywords: ["comfortable", "casual", "fleece"] },
  { value: "jodhpurs-riding-breeches", label: "Jodhpurs/Riding Breeches", category: "bottoms", subcategory: "equestrian", keywords: ["equestrian", "fitted", "knee patches"] },

  // Dresses
  { value: "little-black-dress-lbd", label: "Little Black Dress (LBD)", category: "dresses", subcategory: "cocktail", keywords: ["classic", "elegant", "versatile"] },
  { value: "maxi-dress-floral-print", label: "Maxi Dress (Floral Print)", category: "dresses", subcategory: "maxi", keywords: ["long", "flowing", "bohemian"] },
  { value: "midi-dress-a-line", label: "Midi Dress (A-Line)", category: "dresses", subcategory: "midi", keywords: ["mid-length", "flattering", "versatile"] },
  { value: "mini-dress-sequin", label: "Mini Dress (Sequin)", category: "dresses", subcategory: "party", keywords: ["short", "sparkly", "party"] },
  { value: "wrap-dress", label: "Wrap Dress", category: "dresses", subcategory: "wrap", keywords: ["flattering", "adjustable", "feminine"] },
  { value: "shirt-dress", label: "Shirt Dress", category: "dresses", subcategory: "casual", keywords: ["button-front", "casual", "versatile"] },
  { value: "sundress-gingham", label: "Sundress (Gingham)", category: "dresses", subcategory: "summer", keywords: ["lightweight", "summer", "cheerful"] },
  { value: "slip-dress-satin", label: "Slip Dress (Satin)", category: "dresses", subcategory: "slip", keywords: ["minimalist", "elegant", "silky"] },
  { value: "bodycon-dress", label: "Bodycon Dress", category: "dresses", subcategory: "fitted", keywords: ["figure-hugging", "stretchy", "sexy"] },
  { value: "fit-and-flare-dress", label: "Fit and Flare Dress", category: "dresses", subcategory: "fit-and-flare", keywords: ["fitted bodice", "flared skirt", "feminine"] },
  { value: "kaftan-dress", label: "Kaftan Dress", category: "dresses", subcategory: "kaftan", keywords: ["loose", "flowing", "resort"] },
  { value: "t-shirt-dress", label: "T-Shirt Dress", category: "dresses", subcategory: "casual", keywords: ["comfortable", "casual", "relaxed"] },
  { value: "sweater-dress", label: "Sweater Dress", category: "dresses", subcategory: "knit", keywords: ["cozy", "warm", "comfortable"] },
  { value: "cocktail-dress-lace", label: "Cocktail Dress (Lace)", category: "dresses", subcategory: "cocktail", keywords: ["elegant", "formal", "delicate"] },
  { value: "ball-gown-tulle", label: "Ball Gown (Tulle)", category: "dresses", subcategory: "formal", keywords: ["voluminous", "formal", "princess"] },
  { value: "sheath-dress", label: "Sheath Dress", category: "dresses", subcategory: "professional", keywords: ["tailored", "business", "sleek"] },
  { value: "peplum-dress", label: "Peplum Dress", category: "dresses", subcategory: "peplum", keywords: ["flared waist", "structured", "feminine"] },
  { value: "jumper-dress-pinafore", label: "Jumper Dress (Pinafore)", category: "dresses", subcategory: "jumper", keywords: ["layering", "vintage", "preppy"] },
  { value: "halter-neck-dress", label: "Halter Neck Dress", category: "dresses", subcategory: "halter", keywords: ["backless", "elegant", "summer"] },
  { value: "one-shoulder-dress", label: "One-Shoulder Dress", category: "dresses", subcategory: "asymmetrical", keywords: ["asymmetrical", "modern", "elegant"] },
  { value: "evening-gown-velvet", label: "Evening Gown (Velvet)", category: "dresses", subcategory: "formal", keywords: ["luxurious", "formal", "rich texture"] },

  // Outerwear
  { value: "trench-coat-classic-beige", label: "Trench Coat (Classic Beige)", category: "outerwear", subcategory: "coats", keywords: ["classic", "water-resistant", "timeless"] },
  { value: "pea-coat-navy-wool", label: "Pea Coat (Navy Wool)", category: "outerwear", subcategory: "coats", keywords: ["naval", "double-breasted", "warm"] },
  { value: "denim-jacket", label: "Denim Jacket", category: "outerwear", subcategory: "jackets", keywords: ["casual", "versatile", "classic"] },
  { value: "leather-biker-jacket", label: "Leather Biker Jacket", category: "outerwear", subcategory: "jackets", keywords: ["edgy", "rebellious", "durable"] },
  { value: "bomber-jacket-nylon", label: "Bomber Jacket (Nylon)", category: "outerwear", subcategory: "jackets", keywords: ["sporty", "casual", "lightweight"] },
  { value: "parka-hooded", label: "Parka (Hooded)", category: "outerwear", subcategory: "parkas", keywords: ["warm", "hooded", "winter"] },
  { value: "blazer-tailored-wool", label: "Blazer (Tailored Wool)", category: "outerwear", subcategory: "blazers", keywords: ["professional", "structured", "formal"] },
  { value: "raincoat-yellow", label: "Raincoat (Yellow)", category: "outerwear", subcategory: "rainwear", keywords: ["waterproof", "bright", "protective"] },
  { value: "puffer-jacket-down-filled", label: "Puffer Jacket (Down-filled)", category: "outerwear", subcategory: "jackets", keywords: ["quilted", "warm", "puffy"] },
  { value: "vest-quilted", label: "Vest (Quilted)", category: "outerwear", subcategory: "vests", keywords: ["layering", "lightweight", "sleeveless"] },
  { value: "anorak-jacket", label: "Anorak Jacket", category: "outerwear", subcategory: "jackets", keywords: ["pullover", "hooded", "windproof"] },
  { value: "duster-coat", label: "Duster Coat", category: "outerwear", subcategory: "coats", keywords: ["long", "flowing", "lightweight"] },
  { value: "cape-coat", label: "Cape Coat", category: "outerwear", subcategory: "coats", keywords: ["dramatic", "elegant", "flowing"] },
  { value: "fleece-jacket", label: "Fleece Jacket", category: "outerwear", subcategory: "jackets", keywords: ["soft", "warm", "casual"] },
  { value: "windbreaker", label: "Windbreaker", category: "outerwear", subcategory: "jackets", keywords: ["lightweight", "wind-resistant", "athletic"] },
  { value: "sport-coat-blazer-linen", label: "Sport Coat/Blazer (Linen)", category: "outerwear", subcategory: "blazers", keywords: ["summer", "lightweight", "breathable"] },
  { value: "overcoat-wool-cashmere", label: "Overcoat (Wool Cashmere Blend)", category: "outerwear", subcategory: "coats", keywords: ["formal", "luxurious", "warm"] },
  { value: "shearling-coat", label: "Shearling Coat", category: "outerwear", subcategory: "coats", keywords: ["cozy", "warm", "textured"] },
  { value: "varsity-jacket", label: "Varsity Jacket", category: "outerwear", subcategory: "jackets", keywords: ["sporty", "collegiate", "retro"] },
  { value: "field-jacket-m65", label: "Field Jacket (M-65 style)", category: "outerwear", subcategory: "military", keywords: ["military", "utility", "pockets"] },

  // Suits & Formal Wear
  { value: "two-piece-suit-mens-navy", label: "Two-Piece Suit (Men's, Navy)", category: "suits", subcategory: "mens-suits", keywords: ["formal", "business", "professional"] },
  { value: "three-piece-suit-mens-grey", label: "Three-Piece Suit (Men's, Grey)", category: "suits", subcategory: "mens-suits", keywords: ["formal", "waistcoat", "classic"] },
  { value: "tuxedo-mens-black-tie", label: "Tuxedo (Men's, Black Tie)", category: "suits", subcategory: "formal", keywords: ["formal", "evening", "elegant"] },
  { value: "womens-pant-suit-power", label: "Women's Pant Suit (Power Suit)", category: "suits", subcategory: "womens-suits", keywords: ["professional", "powerful", "business"] },
  { value: "skirt-suit-womens", label: "Skirt Suit (Women's)", category: "suits", subcategory: "womens-suits", keywords: ["professional", "feminine", "business"] },
  { value: "morning-suit-mens", label: "Morning Suit (Men's)", category: "suits", subcategory: "formal", keywords: ["formal", "daywear", "traditional"] },
  { value: "jumpsuit-formal", label: "Jumpsuit (Formal)", category: "suits", subcategory: "jumpsuits", keywords: ["elegant", "modern", "alternative"] },
  { value: "waistcoat-vest-formal", label: "Waistcoat/Vest (Formal)", category: "suits", subcategory: "accessories", keywords: ["formal", "layering", "traditional"] },
  { value: "cummerbund", label: "Cummerbund", category: "suits", subcategory: "accessories", keywords: ["formal", "tuxedo", "traditional"] },

  // Fashion Styles
  { value: "minimalist-fashion", label: "Minimalist Fashion", category: "styles", keywords: ["clean", "simple", "neutral", "timeless"] },
  { value: "bohemian-boho-fashion", label: "Bohemian (Boho) Fashion", category: "styles", keywords: ["flowing", "layered", "earthy", "free-spirited"] },
  { value: "vintage-1950s-fashion", label: "Vintage (1950s) Fashion", category: "styles", keywords: ["retro", "classic", "nostalgic", "timeless"] },
  { value: "grunge-fashion", label: "Grunge Fashion", category: "styles", keywords: ["distressed", "rebellious", "layered", "alternative"] },
  { value: "preppy-fashion", label: "Preppy Fashion", category: "styles", keywords: ["clean-cut", "classic", "ivy-league", "polished"] },
  { value: "athleisure-wear", label: "Athleisure Wear", category: "styles", keywords: ["comfortable", "sporty", "functional", "trendy"] },
  { value: "streetwear-fashion", label: "Streetwear Fashion", category: "styles", keywords: ["urban", "casual", "trendy", "graphic"] },
  { value: "punk-rock-fashion", label: "Punk Rock Fashion", category: "styles", keywords: ["rebellious", "edgy", "studded", "alternative"] },
  { value: "gothic-fashion", label: "Gothic Fashion", category: "styles", keywords: ["dark", "dramatic", "romantic", "mysterious"] },
  { value: "cyberpunk-fashion", label: "Cyberpunk Fashion", category: "styles", keywords: ["futuristic", "tech", "neon", "edgy"] },
  { value: "steampunk-fashion", label: "Steampunk Fashion", category: "styles", keywords: ["victorian", "mechanical", "vintage", "alternative"] },
  { value: "coastal-grandmother-style", label: "Coastal Grandmother Style", category: "styles", keywords: ["relaxed", "elegant", "neutral", "comfortable"] },
  { value: "y2k-fashion", label: "Y2K Fashion", category: "styles", keywords: ["early-2000s", "nostalgic", "colorful", "futuristic"] },
  { value: "academia-dark-light-fashion", label: "Academia (Dark/Light) Fashion", category: "styles", keywords: ["scholarly", "classic", "intellectual", "literary"] },
  { value: "normcore-fashion", label: "Normcore Fashion", category: "styles", keywords: ["unassuming", "basic", "comfortable", "unpretentious"] },
  { value: "e-girl-e-boy-fashion", label: "E-Girl/E-Boy Fashion", category: "styles", keywords: ["internet", "alternative", "colorful", "subculture"] },
  { value: "cottagecore-fashion", label: "Cottagecore Fashion", category: "styles", keywords: ["rural", "romantic", "vintage", "natural"] },
  { value: "business-casual-mens", label: "Business Casual (Men's)", category: "styles", keywords: ["professional", "relaxed", "smart-casual", "versatile"] },
  { value: "business-casual-womens", label: "Business Casual (Women's)", category: "styles", keywords: ["professional", "polished", "comfortable", "versatile"] },

  // Accessories
  { value: "scarf-silk-square", label: "Scarf (Silk Square)", category: "accessories", subcategory: "scarves", keywords: ["elegant", "patterned", "versatile"] },
  { value: "scarf-winter-wool", label: "Scarf (Winter Wool)", category: "accessories", subcategory: "scarves", keywords: ["warm", "chunky", "cozy"] },
  { value: "beanie-hat", label: "Beanie Hat", category: "accessories", subcategory: "hats", keywords: ["casual", "warm", "knit"] },
  { value: "baseball-cap", label: "Baseball Cap", category: "accessories", subcategory: "hats", keywords: ["sporty", "casual", "adjustable"] },
  { value: "fedora-hat", label: "Fedora Hat", category: "accessories", subcategory: "hats", keywords: ["classic", "elegant", "vintage"] },
  { value: "gloves-leather", label: "Gloves (Leather)", category: "accessories", subcategory: "gloves", keywords: ["elegant", "warm", "sophisticated"] },
  { value: "gloves-knit", label: "Gloves (Knit)", category: "accessories", subcategory: "gloves", keywords: ["warm", "cozy", "casual"] },
  { value: "socks-crew", label: "Socks (Crew)", category: "accessories", subcategory: "socks", keywords: ["basic", "comfortable", "everyday"] },
  { value: "socks-ankle", label: "Socks (Ankle)", category: "accessories", subcategory: "socks", keywords: ["low-cut", "athletic", "discreet"] },
  { value: "tights-opaque", label: "Tights (Opaque)", category: "accessories", subcategory: "hosiery", keywords: ["warm", "opaque", "layering"] },
  { value: "belt-leather", label: "Belt (Leather)", category: "accessories", subcategory: "belts", keywords: ["classic", "durable", "versatile"] },
  { value: "suspenders-braces", label: "Suspenders/Braces", category: "accessories", subcategory: "belts", keywords: ["vintage", "formal", "functional"] },
  { value: "bow-tie", label: "Bow Tie", category: "accessories", subcategory: "neckwear", keywords: ["formal", "elegant", "classic"] },
  { value: "necktie-silk", label: "Necktie (Silk)", category: "accessories", subcategory: "neckwear", keywords: ["formal", "business", "elegant"] },
  { value: "pocket-square", label: "Pocket Square", category: "accessories", subcategory: "accessories", keywords: ["formal", "elegant", "detail"] },

  // Underwear & Loungewear
  { value: "silk-pajama-set", label: "Silk Pajama Set", category: "underwear", subcategory: "sleepwear", keywords: ["luxurious", "soft", "elegant"] },
  { value: "flannel-pajama-set", label: "Flannel Pajama Set", category: "underwear", subcategory: "sleepwear", keywords: ["warm", "cozy", "comfortable"] },
  { value: "nightgown-cotton", label: "Nightgown (Cotton)", category: "underwear", subcategory: "sleepwear", keywords: ["comfortable", "breathable", "classic"] },
  { value: "robe-terry-cloth", label: "Robe (Terry Cloth)", category: "underwear", subcategory: "robes", keywords: ["absorbent", "comfortable", "spa-like"] },
  { value: "silk-robe-kimono", label: "Silk Robe/Kimono Robe", category: "underwear", subcategory: "robes", keywords: ["luxurious", "elegant", "flowing"] },
  { value: "onesie-adult-pajama", label: "Onesie (Adult Pajama)", category: "underwear", subcategory: "sleepwear", keywords: ["fun", "cozy", "playful"] },
  { value: "lounge-shorts", label: "Lounge Shorts", category: "underwear", subcategory: "loungewear", keywords: ["comfortable", "soft", "relaxed"] },
  { value: "lounge-pants-wide-leg", label: "Lounge Pants (Wide Leg)", category: "underwear", subcategory: "loungewear", keywords: ["comfortable", "flowing", "relaxed"] },
  { value: "chemise-babydoll", label: "Chemise/Babydoll", category: "underwear", subcategory: "lingerie", keywords: ["delicate", "feminine", "elegant"] },
  { value: "thermal-underwear-set", label: "Thermal Underwear Set (Long Johns)", category: "underwear", subcategory: "thermals", keywords: ["warm", "layering", "functional"] },

  // Uniforms & Workwear
  { value: "lab-coat", label: "Lab Coat", category: "uniforms", subcategory: "medical", keywords: ["professional", "clean", "protective"] },
  { value: "scrubs-medical", label: "Scrubs (Medical)", category: "uniforms", subcategory: "medical", keywords: ["comfortable", "professional", "practical"] },
  { value: "chefs-uniform", label: "Chef's Uniform", category: "uniforms", subcategory: "culinary", keywords: ["professional", "functional", "traditional"] },
  { value: "flight-suit", label: "Flight Suit", category: "uniforms", subcategory: "aviation", keywords: ["functional", "professional", "technical"] },
  { value: "racing-suit-auto", label: "Racing Suit (Auto)", category: "uniforms", subcategory: "sports", keywords: ["protective", "professional", "technical"] },
  { value: "academic-gown-graduation", label: "Academic Gown (Graduation)", category: "uniforms", subcategory: "academic", keywords: ["formal", "ceremonial", "traditional"] },
  { value: "choir-robe", label: "Choir Robe", category: "uniforms", subcategory: "religious", keywords: ["formal", "flowing", "ceremonial"] },
  { value: "band-uniform-jacket", label: "Band Uniform Jacket", category: "uniforms", subcategory: "musical", keywords: ["ornate", "formal", "decorative"] },

  // Activewear
  { value: "ballet-leotard", label: "Ballet Leotard", category: "activewear", subcategory: "dance", keywords: ["fitted", "flexible", "dance"] },
  { value: "tutu-ballet", label: "Tutu (Ballet)", category: "activewear", subcategory: "dance", keywords: ["dance", "layered", "performance"] },
  { value: "wetsuit-surfing", label: "Wetsuit (Surfing)", category: "activewear", subcategory: "water-sports", keywords: ["neoprene", "protective", "flexible"] },
  { value: "drysuit-diving", label: "Drysuit (Diving)", category: "activewear", subcategory: "water-sports", keywords: ["waterproof", "protective", "technical"] },
  { value: "martial-arts-gi", label: "Martial Arts Gi (Karate/Judo)", category: "activewear", subcategory: "martial-arts", keywords: ["traditional", "durable", "functional"] },
  { value: "fencing-uniform", label: "Fencing Uniform", category: "activewear", subcategory: "fencing", keywords: ["protective", "technical", "sport"] },
  { value: "equestrian-riding-jacket", label: "Equestrian Riding Jacket", category: "activewear", subcategory: "equestrian", keywords: ["tailored", "protective", "elegant"] },
  { value: "swimsuit-one-piece-womens", label: "Swimsuit (One-Piece Women's)", category: "activewear", subcategory: "swimwear", keywords: ["athletic", "supportive", "streamlined"] },
  { value: "bikini-two-piece-womens", label: "Bikini (Two-Piece Women's)", category: "activewear", subcategory: "swimwear", keywords: ["two-piece", "summer", "beach"] },
  { value: "swim-trunks-mens", label: "Swim Trunks (Men's)", category: "activewear", subcategory: "swimwear", keywords: ["quick-dry", "comfortable", "athletic"] },

  // Traditional Clothing
  { value: "sari-silk", label: "Sari (Silk)", category: "traditional", subcategory: "indian", keywords: ["elegant", "traditional", "draped"] },
  { value: "kimono-japanese-furisode", label: "Kimono (Japanese, Furisode)", category: "traditional", subcategory: "japanese", keywords: ["traditional", "elegant", "ceremonial"] },
  { value: "hanbok-korean-female", label: "Hanbok (Korean, Female)", category: "traditional", subcategory: "korean", keywords: ["traditional", "colorful", "elegant"] },
  { value: "dirndl-german-austrian", label: "Dirndl (German/Austrian)", category: "traditional", subcategory: "european", keywords: ["traditional", "festive", "cultural"] },
  { value: "cheongsam-qipao-chinese", label: "Cheongsam/Qipao (Chinese)", category: "traditional", subcategory: "chinese", keywords: ["fitted", "elegant", "traditional"] },
  { value: "kilt-scottish", label: "Kilt (Scottish)", category: "traditional", subcategory: "scottish", keywords: ["tartan", "traditional", "ceremonial"] },
  { value: "dashiki-african", label: "Dashiki (African)", category: "traditional", subcategory: "african", keywords: ["colorful", "traditional", "cultural"] },
  { value: "jalabiya-thobe-middle-eastern", label: "Jalabiya/Thobe (Middle Eastern)", category: "traditional", subcategory: "middle-eastern", keywords: ["flowing", "traditional", "comfortable"] },
  { value: "sherwani-south-asian-mens", label: "Sherwani (South Asian Men's)", category: "traditional", subcategory: "south-asian", keywords: ["formal", "embroidered", "ceremonial"] },
  { value: "ao-dai-vietnamese", label: "Ao Dai (Vietnamese)", category: "traditional", subcategory: "vietnamese", keywords: ["elegant", "traditional", "flowing"] },
  { value: "lederhosen-german", label: "Lederhosen (German)", category: "traditional", subcategory: "german", keywords: ["leather", "traditional", "bavarian"] },
  { value: "sarong", label: "Sarong", category: "traditional", subcategory: "tropical", keywords: ["wrapped", "versatile", "beach"] },
  { value: "caftan-mens-ornate", label: "Caftan (Men's, Ornate)", category: "traditional", subcategory: "middle-eastern", keywords: ["flowing", "ornate", "traditional"] },

  // Specialty Items
  { value: "apron-chefs", label: "Apron (Chef's)", category: "uniforms", subcategory: "culinary", keywords: ["protective", "professional", "clean"] },
  { value: "apron-utility-work", label: "Apron (Utility/Work)", category: "uniforms", subcategory: "work", keywords: ["durable", "functional", "protective"] },
  { value: "smoking-jacket-velvet", label: "Smoking Jacket (Velvet)", category: "outerwear", subcategory: "loungewear", keywords: ["luxurious", "elegant", "vintage"] },
  { value: "nehru-jacket", label: "Nehru Jacket", category: "outerwear", subcategory: "ethnic", keywords: ["mandarin collar", "formal", "cultural"] }
];

// Helper functions for searching and filtering
export const searchClothingItems = (query: string): ClothingItem[] => {
  if (!query.trim()) return clothingItems;
  
  const lowerQuery = query.toLowerCase();
  return clothingItems.filter(item => 
    item.label.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery) ||
    item.subcategory?.toLowerCase().includes(lowerQuery) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
};

export const getItemsByCategory = (category: string): ClothingItem[] => {
  return clothingItems.filter(item => item.category === category);
};

export const getAllCategories = (): string[] => {
  return Object.keys(clothingCategories);
};

export const getRecentlyUsedItems = (recentValues: string[]): ClothingItem[] => {
  return clothingItems.filter(item => recentValues.includes(item.value));
};
