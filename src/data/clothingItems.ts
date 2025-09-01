// Comprehensive clothing items database with hierarchical organization
export interface ClothingItem {
  value: string;
  label: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  description?: string;
  detailedPrompt?: string;
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
  nigerian: "Nigerian Contemporary Fashion",
  underwear: "Underwear & Loungewear",
  uniforms: "Uniforms & Workwear",
  styles: "Fashion Styles",
  sustainable: "Sustainable & Eco-Friendly",
  performance: "Performance & Tech Wear",
} as const;

export const clothingItems: ClothingItem[] = [
  // Tops (Women's & Unisex)
  { 
    value: "basic-t-shirt-crew-neck", 
    label: "Basic T-Shirt (Crew Neck)", 
    category: "tops", 
    subcategory: "t-shirts", 
    keywords: ["basic", "crew neck", "cotton", "casual"],
    description: "Classic crew neck t-shirt",
    detailedPrompt: "White cotton crew neck t-shirt, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, detailed fabric texture, 8K"
  },
  { 
    value: "v-neck-t-shirt", 
    label: "V-Neck T-Shirt", 
    category: "tops", 
    subcategory: "t-shirts", 
    keywords: ["v-neck", "casual", "cotton"],
    detailedPrompt: "Heather grey v-neck t-shirt, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, soft cotton texture, 8K"
  },
  { 
    value: "long-sleeve-t-shirt", 
    label: "Long-Sleeve T-Shirt", 
    category: "tops", 
    subcategory: "t-shirts", 
    keywords: ["long sleeve", "layering", "casual"],
    detailedPrompt: "Navy blue long-sleeve t-shirt, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, ribbed cuffs, 8K"
  },
  { 
    value: "tank-top", 
    label: "Tank Top", 
    category: "tops", 
    subcategory: "t-shirts", 
    keywords: ["sleeveless", "summer", "athletic"],
    detailedPrompt: "Black ribbed tank top, worn by a young Nigerian woman with an athletic build, photo realistic, studio lighting, white background, form-fitting, 8K"
  },
  { 
    value: "crop-top", 
    label: "Crop Top", 
    category: "tops", 
    subcategory: "t-shirts", 
    keywords: ["cropped", "trendy", "summer"],
    detailedPrompt: "Yellow knit crop top, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, textured knit, 8K"
  },
  { 
    value: "blouse-silk", 
    label: "Blouse (Silk)", 
    category: "tops", 
    subcategory: "blouses", 
    keywords: ["silk", "elegant", "formal", "flowing"],
    detailedPrompt: "Emerald green silk blouse, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, lustrous sheen, delicate drape, 8K"
  },
  { 
    value: "button-down-shirt-oxford", 
    label: "Button-Down Shirt (Oxford)", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["oxford", "formal", "business", "cotton"],
    detailedPrompt: "Classic white Oxford button-down shirt, worn by a young Nigerian woman, casually styled, photo realistic, studio lighting, white background, crisp cotton, 8K"
  },
  { 
    value: "tunic", 
    label: "Tunic", 
    category: "tops", 
    subcategory: "blouses", 
    keywords: ["loose", "comfortable", "bohemian"],
    detailedPrompt: "Linen beige tunic top, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, relaxed fit, natural fabric texture, 8K"
  },
  { 
    value: "sweater-crew-neck-wool", 
    label: "Sweater (Crew Neck Wool)", 
    category: "tops", 
    subcategory: "sweaters", 
    keywords: ["wool", "warm", "chunky knit"],
    detailedPrompt: "Charcoal grey crew neck wool sweater, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, chunky knit texture, 8K"
  },
  { 
    value: "cardigan-button-up", 
    label: "Cardigan (Button-Up)", 
    category: "tops", 
    subcategory: "sweaters", 
    keywords: ["layering", "button-up", "cozy"],
    detailedPrompt: "Burgundy merino wool button-up cardigan, worn open over a simple top by a young Nigerian woman, photo realistic, studio lighting, white background, fine gauge knit, 8K"
  },
  { 
    value: "hoodie-pullover", 
    label: "Hoodie (Pullover)", 
    category: "tops", 
    subcategory: "hoodies", 
    keywords: ["casual", "comfortable", "drawstring"],
    detailedPrompt: "Light grey pullover hoodie with drawstrings, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, soft fleece, 8K"
  },
  { 
    value: "zip-up-hoodie", 
    label: "Zip-Up Hoodie", 
    category: "tops", 
    subcategory: "hoodies", 
    keywords: ["zip", "layering", "athletic"],
    detailedPrompt: "Black zip-up hoodie, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, metal zipper detail, 8K"
  },
  { 
    value: "polo-shirt", 
    label: "Polo Shirt", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["collar", "casual", "sporty"],
    detailedPrompt: "Navy blue cotton polo shirt, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, pique texture, 8K"
  },
  { 
    value: "peasant-top", 
    label: "Peasant Top", 
    category: "tops", 
    subcategory: "blouses", 
    keywords: ["bohemian", "embroidered", "flowing"],
    detailedPrompt: "White embroidered peasant top with bell sleeves, worn by a young Nigerian woman, photo realistic, studio lighting, white background, bohemian style, 8K"
  },
  { 
    value: "camisole-lace-trim", 
    label: "Camisole (Lace Trim)", 
    category: "tops", 
    subcategory: "camisoles", 
    keywords: ["delicate", "lace", "layering"],
    detailedPrompt: "Ivory silk camisole with lace trim, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, delicate details, 8K"
  },
  { 
    value: "halter-top", 
    label: "Halter Top", 
    category: "tops", 
    subcategory: "tops", 
    keywords: ["backless", "summer", "strappy"],
    detailedPrompt: "Red satin halter top, worn by a young Nigerian woman, backless design visible, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "off-the-shoulder-top", 
    label: "Off-the-Shoulder Top", 
    category: "tops", 
    subcategory: "tops", 
    keywords: ["shoulders", "romantic", "trendy"],
    detailedPrompt: "Floral print off-the-shoulder top with a ruffled neckline, worn by a young Nigerian woman, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "tube-top", 
    label: "Tube Top", 
    category: "tops", 
    subcategory: "tops", 
    keywords: ["strapless", "summer", "fitted"],
    detailedPrompt: "Striped knit tube top, worn by a young Nigerian woman as a model, photo realistic, studio lighting, white background, stretch fabric, 8K"
  },
  { 
    value: "bodysuit-long-sleeve", 
    label: "Bodysuit (Long Sleeve)", 
    category: "tops", 
    subcategory: "bodysuits", 
    keywords: ["fitted", "sleek", "layering"],
    detailedPrompt: "Black long sleeve turtleneck bodysuit, worn by a young Nigerian woman, photo realistic, studio lighting, white background, sleek fit, 8K"
  },
  { 
    value: "kimono-top", 
    label: "Kimono Top", 
    category: "tops", 
    subcategory: "tops", 
    keywords: ["flowing", "wide sleeves", "oriental"],
    detailedPrompt: "Printed silk kimono top with wide sleeves, worn by a young Nigerian woman over a simple outfit, photo realistic, studio lighting, white background, vibrant pattern, 8K"
  },

  // Tops (Men's & Unisex)
  { 
    value: "henley-shirt-long-sleeve", 
    label: "Henley Shirt (Long Sleeve)", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["buttons", "casual", "layering"],
    detailedPrompt: "Olive green long sleeve Henley shirt, worn by a young Nigerian man as a model, photo realistic, studio lighting, white background, button placket detail, waffle knit, 8K"
  },
  { 
    value: "flannel-shirt", 
    label: "Flannel Shirt", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["plaid", "warm", "casual"],
    detailedPrompt: "Red and black plaid flannel shirt, worn open over a t-shirt by a young Nigerian man, photo realistic, studio lighting, white background, brushed cotton texture, 8K"
  },
  { 
    value: "chambray-shirt", 
    label: "Chambray Shirt", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["denim-like", "casual", "lightweight"],
    detailedPrompt: "Light blue chambray shirt, worn by a young Nigerian man as a model, photo realistic, studio lighting, white background, denim-like appearance, 8K"
  },
  { 
    value: "guayabera-shirt", 
    label: "Guayabera Shirt", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["embroidered", "formal", "traditional"],
    detailedPrompt: "White linen Guayabera shirt with embroidery, worn by a young Nigerian man as a model, photo realistic, studio lighting, white background, traditional details, 8K"
  },
  { 
    value: "rugby-shirt", 
    label: "Rugby Shirt", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["striped", "sporty", "durable"],
    detailedPrompt: "Striped cotton rugby shirt with a white collar, worn by a young Nigerian man, photo realistic, studio lighting, white background, durable fabric, 8K"
  },
  { 
    value: "hawaiian-shirt", 
    label: "Hawaiian Shirt", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["tropical", "vacation", "colorful"],
    detailedPrompt: "Vibrant floral Hawaiian shirt with a camp collar, worn by a young Nigerian man as a model, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "sweatshirt-crew-neck", 
    label: "Sweatshirt (Crew Neck)", 
    category: "tops", 
    subcategory: "sweatshirts", 
    keywords: ["fleece", "comfortable", "casual"],
    detailedPrompt: "Navy blue crew neck sweatshirt, worn by a young Nigerian man as a model, photo realistic, studio lighting, white background, soft fleece, 8K"
  },
  { 
    value: "baseball-tee-raglan", 
    label: "Baseball Tee (Raglan)", 
    category: "tops", 
    subcategory: "t-shirts", 
    keywords: ["raglan", "sporty", "contrasting"],
    detailedPrompt: "White baseball tee with contrasting navy 3/4 raglan sleeves, worn by a young Nigerian man, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "muscle-shirt", 
    label: "Muscle Shirt", 
    category: "tops", 
    subcategory: "t-shirts", 
    keywords: ["athletic", "fitted", "sleeveless"],
    detailedPrompt: "Grey cotton muscle shirt, worn by a young Nigerian man with an athletic build, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "bowling-shirt", 
    label: "Bowling Shirt", 
    category: "tops", 
    subcategory: "shirts", 
    keywords: ["retro", "camp collar", "embroidered"],
    detailedPrompt: "Retro style two-tone bowling shirt, worn by a young Nigerian man as a model, photo realistic, studio lighting, white background, camp collar, 8K"
  },

  // Bottoms (Women's & Unisex)
  { 
    value: "skinny-jeans", 
    label: "Skinny Jeans", 
    category: "bottoms", 
    subcategory: "jeans", 
    keywords: ["fitted", "stretchy", "modern"],
    detailedPrompt: "Dark wash denim skinny jeans, worn by a young Nigerian woman as a model, full body shot, photo realistic, studio lighting, white background, slight distressing, 8K"
  },
  { 
    value: "straight-leg-jeans", 
    label: "Straight-Leg Jeans", 
    category: "bottoms", 
    subcategory: "jeans", 
    keywords: ["classic", "versatile", "timeless"],
    detailedPrompt: "Medium wash straight-leg jeans, worn by a young Nigerian woman as a model, full body shot, photo realistic, studio lighting, white background, classic fit, 8K"
  },
  { 
    value: "boyfriend-jeans", 
    label: "Boyfriend Jeans", 
    category: "bottoms", 
    subcategory: "jeans", 
    keywords: ["relaxed", "distressed", "casual"],
    detailedPrompt: "Light wash distressed boyfriend jeans with rolled cuffs, worn by a young Nigerian woman, relaxed fit, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "wide-leg-trousers", 
    label: "Wide-Leg Trousers", 
    category: "bottoms", 
    subcategory: "trousers", 
    keywords: ["flowing", "elegant", "comfortable"],
    detailedPrompt: "Beige linen wide-leg trousers, worn by a young Nigerian woman as a model, high-waisted, full body shot, photo realistic, studio lighting, white background, flowing silhouette, 8K"
  },
  { 
    value: "palazzo-pants", 
    label: "Palazzo Pants", 
    category: "bottoms", 
    subcategory: "pants", 
    keywords: ["wide", "flowing", "bohemian"],
    detailedPrompt: "Printed silk palazzo pants with an extremely wide leg, worn by a young Nigerian woman, full body shot, photo realistic, studio lighting, white background, luxurious drape, 8K"
  },
  { 
    value: "leggings-athletic", 
    label: "Leggings (Athletic)", 
    category: "bottoms", 
    subcategory: "leggings", 
    keywords: ["stretchy", "athletic", "comfortable"],
    detailedPrompt: "Black high-waisted athletic leggings, worn by a young Nigerian woman, full body shot, photo realistic, studio lighting, white background, moisture-wicking fabric, 8K"
  },
  { 
    value: "culottes", 
    label: "Culottes", 
    category: "bottoms", 
    subcategory: "pants", 
    keywords: ["wide", "cropped", "flowing"],
    detailedPrompt: "Navy blue pleated culottes, worn by a young Nigerian woman as a model, full body shot, photo realistic, studio lighting, white background, calf-length, 8K"
  },
  { 
    value: "capri-pants", 
    label: "Capri Pants", 
    category: "bottoms", 
    subcategory: "pants", 
    keywords: ["cropped", "summer", "casual"],
    detailedPrompt: "White stretch cotton capri pants, worn by a young Nigerian woman as a model, slim fit, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "cargo-pants-utility", 
    label: "Cargo Pants (Utility)", 
    category: "bottoms", 
    subcategory: "pants", 
    keywords: ["pockets", "utility", "casual"],
    detailedPrompt: "Olive green cotton cargo pants with multiple pockets, worn by a young Nigerian woman, utilitarian style, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "chinos-slim-fit", 
    label: "Chinos (Slim Fit)", 
    category: "bottoms", 
    subcategory: "chinos", 
    keywords: ["smart casual", "tailored", "versatile"],
    detailedPrompt: "Khaki slim fit chinos, worn by a young Nigerian woman, smart casual, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "sweatpants-joggers", 
    label: "Sweatpants (Joggers)", 
    category: "bottoms", 
    subcategory: "sweatpants", 
    keywords: ["comfortable", "athletic", "casual"],
    detailedPrompt: "Grey marl jogger sweatpants with cuffed ankles, worn by a young Nigerian woman, casual style, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "yoga-pants-flared", 
    label: "Yoga Pants (Flared)", 
    category: "bottoms", 
    subcategory: "activewear", 
    keywords: ["stretchy", "comfortable", "flared"],
    detailedPrompt: "Black flared yoga pants, worn by a young Nigerian woman as a model, full body shot, photo realistic, studio lighting, white background, comfortable stretch fabric, 8K"
  },
  { 
    value: "bike-shorts", 
    label: "Bike Shorts", 
    category: "bottoms", 
    subcategory: "shorts", 
    keywords: ["fitted", "athletic", "cycling"],
    detailedPrompt: "Neon green cycling bike shorts, worn by a young Nigerian woman as a model, full body shot, photo realistic, studio lighting, white background, spandex material, 8K"
  },
  { 
    value: "denim-shorts-cut-off", 
    label: "Denim Shorts (Cut-Off)", 
    category: "bottoms", 
    subcategory: "shorts", 
    keywords: ["casual", "frayed", "summer"],
    detailedPrompt: "Light blue cut-off denim shorts with frayed hem, worn by a young Nigerian woman, full body shot, photo realistic, studio lighting, white background, distressed look, 8K"
  },
  { 
    value: "bermuda-shorts", 
    label: "Bermuda Shorts", 
    category: "bottoms", 
    subcategory: "shorts", 
    keywords: ["knee-length", "tailored", "smart casual"],
    detailedPrompt: "Navy tailored Bermuda shorts, worn by a young Nigerian woman as a model, knee-length, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "leather-pants-skinny", 
    label: "Leather Pants (Skinny)", 
    category: "bottoms", 
    subcategory: "pants", 
    keywords: ["edgy", "fitted", "trendy"],
    detailedPrompt: "Black faux leather skinny pants, worn by a young Nigerian woman, edgy look, full body shot, photo realistic, studio lighting, white background, slight sheen, 8K"
  },
  { 
    value: "corduroy-pants", 
    label: "Corduroy Pants", 
    category: "bottoms", 
    subcategory: "pants", 
    keywords: ["textured", "retro", "warm"],
    detailedPrompt: "Brown corduroy straight-leg pants, worn by a young Nigerian woman as a model, full body shot, photo realistic, studio lighting, white background, textured wales, 8K"
  },
  { 
    value: "track-pants-retro", 
    label: "Track Pants (Retro)", 
    category: "bottoms", 
    subcategory: "athletic", 
    keywords: ["sporty", "striped", "retro"],
    detailedPrompt: "Red track pants with white side stripes, worn by a young Nigerian woman, athletic style, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "harem-pants", 
    label: "Harem Pants", 
    category: "bottoms", 
    subcategory: "pants", 
    keywords: ["dropped crotch", "bohemian", "comfortable"],
    detailedPrompt: "Patterned lightweight harem pants with a dropped crotch, worn by a young Nigerian woman, full body shot, photo realistic, studio lighting, white background, bohemian style, 8K"
  },
  { 
    value: "sailor-pants", 
    label: "Sailor Pants", 
    category: "bottoms", 
    subcategory: "pants", 
    keywords: ["nautical", "wide leg", "buttons"],
    detailedPrompt: "Navy blue high-waisted sailor pants with gold button details, worn by a young Nigerian woman, wide leg, full body shot, photo realistic, studio lighting, white background, 8K"
  },

  // Bottoms (Men's & Unisex)
  { 
    value: "dress-trousers-wool", 
    label: "Dress Trousers (Wool)", 
    category: "bottoms", 
    subcategory: "trousers", 
    keywords: ["formal", "tailored", "business"],
    detailedPrompt: "Charcoal grey wool dress trousers with a creased front, worn by a young Nigerian man, full body shot, photo realistic, studio lighting, white background, tailored fit, 8K"
  },
  { 
    value: "khaki-shorts", 
    label: "Khaki Shorts", 
    category: "bottoms", 
    subcategory: "shorts", 
    keywords: ["casual", "classic", "versatile"],
    detailedPrompt: "Classic knee-length khaki twill shorts, worn by a young Nigerian man, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "cargo-shorts", 
    label: "Cargo Shorts", 
    category: "bottoms", 
    subcategory: "shorts", 
    keywords: ["pockets", "utility", "casual"],
    detailedPrompt: "Beige cotton cargo shorts with multiple pockets, worn by a young Nigerian man, full body shot, photo realistic, studio lighting, white background, durable fabric, 8K"
  },
  { 
    value: "board-shorts", 
    label: "Board Shorts", 
    category: "bottoms", 
    subcategory: "swimwear", 
    keywords: ["surfing", "quick-dry", "athletic"],
    detailedPrompt: "Tropical print board shorts, worn by a young Nigerian man as a model, full body shot, photo realistic, studio lighting, white background, quick-dry fabric, 8K"
  },
  { 
    value: "jean-shorts-mens", 
    label: "Jean Shorts (Men's)", 
    category: "bottoms", 
    subcategory: "shorts", 
    keywords: ["denim", "casual", "classic"],
    detailedPrompt: "Medium wash men's denim jean shorts, worn by a young Nigerian man, classic fit, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "pajama-pants", 
    label: "Pajama Pants", 
    category: "bottoms", 
    subcategory: "sleepwear", 
    keywords: ["comfortable", "soft", "loungewear"],
    detailedPrompt: "Plaid flannel pajama pants, worn by a young Nigerian man, relaxed loungewear, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "overalls-denim", 
    label: "Overalls (Denim)", 
    category: "bottoms", 
    subcategory: "overalls", 
    keywords: ["workwear", "vintage", "casual"],
    detailedPrompt: "Blue denim overalls, worn by a young Nigerian man over a t-shirt, classic workwear style, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "work-pants-canvas", 
    label: "Work Pants (Canvas)", 
    category: "bottoms", 
    subcategory: "workwear", 
    keywords: ["durable", "reinforced", "utility"],
    detailedPrompt: "Tan canvas work pants with reinforced knees, worn by a young Nigerian man, rugged style, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "athletic-shorts-running", 
    label: "Athletic Shorts (Running)", 
    category: "bottoms", 
    subcategory: "activewear", 
    keywords: ["athletic", "lightweight", "moisture-wicking"],
    detailedPrompt: "Black lightweight running shorts with side mesh panels, worn by a young Nigerian man, full body shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "sweat-shorts", 
    label: "Sweat Shorts", 
    category: "bottoms", 
    subcategory: "shorts", 
    keywords: ["comfortable", "casual", "fleece"],
    detailedPrompt: "Heather grey fleece sweat shorts, worn by a young Nigerian man, casual comfort, full body shot, photo realistic, studio lighting, white background, 8K"
  },

  // Dresses
  { 
    value: "little-black-dress-lbd", 
    label: "Little Black Dress (LBD)", 
    category: "dresses", 
    subcategory: "cocktail", 
    keywords: ["classic", "elegant", "versatile"],
    detailedPrompt: "Classic sleeveless little black dress in a sheath silhouette, worn by a young Nigerian woman, photo realistic, studio lighting, white background, elegant fabric, 8K"
  },
  { 
    value: "maxi-dress-floral-print", 
    label: "Maxi Dress (Floral Print)", 
    category: "dresses", 
    subcategory: "maxi", 
    keywords: ["long", "flowing", "bohemian"],
    detailedPrompt: "Floral print bohemian maxi dress with spaghetti straps, worn by a young Nigerian woman, photo realistic, studio lighting, white background, flowing chiffon, 8K"
  },
  { 
    value: "midi-dress-a-line", 
    label: "Midi Dress (A-Line)", 
    category: "dresses", 
    subcategory: "midi", 
    keywords: ["mid-length", "flattering", "versatile"],
    detailedPrompt: "Red A-line midi dress with a defined waist, worn by a young Nigerian woman, photo realistic, studio lighting, white background, textured cotton, 8K"
  },
  { 
    value: "mini-dress-sequin", 
    label: "Mini Dress (Sequin)", 
    category: "dresses", 
    subcategory: "party", 
    keywords: ["short", "sparkly", "party"],
    detailedPrompt: "Silver sequin mini dress, worn by a young Nigerian woman, party wear, photo realistic, studio lighting, white background, sparkling embellishments, 8K"
  },
  { 
    value: "wrap-dress", 
    label: "Wrap Dress", 
    category: "dresses", 
    subcategory: "wrap", 
    keywords: ["flattering", "adjustable", "feminine"],
    detailedPrompt: "Navy blue jersey wrap dress, worn by a young Nigerian woman, flattering silhouette, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "shirt-dress", 
    label: "Shirt Dress", 
    category: "dresses", 
    subcategory: "casual", 
    keywords: ["button-front", "casual", "versatile"],
    detailedPrompt: "Striped cotton shirt dress with a belt, worn by a young Nigerian woman, photo realistic, studio lighting, white background, button-front, 8K"
  },
  { 
    value: "sundress-gingham", 
    label: "Sundress (Gingham)", 
    category: "dresses", 
    subcategory: "summer", 
    keywords: ["lightweight", "summer", "cheerful"],
    detailedPrompt: "Yellow gingham sundress with tie shoulders, worn by a young Nigerian woman, photo realistic, studio lighting, white background, lightweight cotton, 8K"
  },
  { 
    value: "slip-dress-satin", 
    label: "Slip Dress (Satin)", 
    category: "dresses", 
    subcategory: "slip", 
    keywords: ["minimalist", "elegant", "silky"],
    detailedPrompt: "Champagne satin slip dress with delicate spaghetti straps, worn by a young Nigerian woman, photo realistic, studio lighting, white background, minimalist, 8K"
  },
  { 
    value: "bodycon-dress", 
    label: "Bodycon Dress", 
    category: "dresses", 
    subcategory: "fitted", 
    keywords: ["figure-hugging", "stretchy", "sexy"],
    detailedPrompt: "Red knit bodycon dress, worn by a young Nigerian woman, figure-hugging, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "fit-and-flare-dress", 
    label: "Fit and Flare Dress", 
    category: "dresses", 
    subcategory: "fit-and-flare", 
    keywords: ["fitted bodice", "flared skirt", "feminine"],
    detailedPrompt: "Polka dot fit and flare dress, worn by a young Nigerian woman, vintage inspired, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "kaftan-dress", 
    label: "Kaftan Dress", 
    category: "dresses", 
    subcategory: "kaftan", 
    keywords: ["loose", "flowing", "resort"],
    detailedPrompt: "Embroidered linen kaftan dress, worn by a young Nigerian woman, relaxed fit, photo realistic, studio lighting, white background, resort wear, 8K"
  },
  { 
    value: "t-shirt-dress", 
    label: "T-Shirt Dress", 
    category: "dresses", 
    subcategory: "casual", 
    keywords: ["comfortable", "casual", "relaxed"],
    detailedPrompt: "Grey marl oversized t-shirt dress, worn by a young Nigerian woman, casual comfort, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "sweater-dress", 
    label: "Sweater Dress", 
    category: "dresses", 
    subcategory: "knit", 
    keywords: ["cozy", "warm", "comfortable"],
    detailedPrompt: "Cream cable knit sweater dress, worn by a young Nigerian woman, cozy and warm, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "cocktail-dress-lace", 
    label: "Cocktail Dress (Lace)", 
    category: "dresses", 
    subcategory: "cocktail", 
    keywords: ["elegant", "formal", "delicate"],
    detailedPrompt: "Navy lace cocktail dress with an illusion neckline, worn by a young Nigerian woman, photo realistic, studio lighting, white background, elegant and formal, 8K"
  },
  { 
    value: "ball-gown-tulle", 
    label: "Ball Gown (Tulle)", 
    category: "dresses", 
    subcategory: "formal", 
    keywords: ["voluminous", "formal", "princess"],
    detailedPrompt: "Princess style tulle ball gown in pastel pink with a beaded bodice, worn by a young Nigerian woman, photo realistic, studio lighting, white background, voluminous skirt, 8K"
  },
  { 
    value: "sheath-dress", 
    label: "Sheath Dress", 
    category: "dresses", 
    subcategory: "professional", 
    keywords: ["tailored", "business", "sleek"],
    detailedPrompt: "Professional grey wool sheath dress, worn by a young Nigerian woman, tailored for business, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "peplum-dress", 
    label: "Peplum Dress", 
    category: "dresses", 
    subcategory: "peplum", 
    keywords: ["flared waist", "structured", "feminine"],
    detailedPrompt: "Black peplum dress with a structured ruffle at the waist, worn by a young Nigerian woman, photo realistic, studio lighting, white background, sophisticated silhouette, 8K"
  },
  { 
    value: "jumper-dress-pinafore", 
    label: "Jumper Dress (Pinafore)", 
    category: "dresses", 
    subcategory: "jumper", 
    keywords: ["layering", "vintage", "preppy"],
    detailedPrompt: "Corduroy pinafore jumper dress in rust color, worn by a young Nigerian woman over a white blouse, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "halter-neck-dress", 
    label: "Halter Neck Dress", 
    category: "dresses", 
    subcategory: "halter", 
    keywords: ["backless", "elegant", "summer"],
    detailedPrompt: "Royal blue halter neck maxi dress with an open back, worn by a young Nigerian woman, photo realistic, studio lighting, white background, elegant evening wear, 8K"
  },
  { 
    value: "one-shoulder-dress", 
    label: "One-Shoulder Dress", 
    category: "dresses", 
    subcategory: "asymmetrical", 
    keywords: ["asymmetrical", "modern", "elegant"],
    detailedPrompt: "Black one-shoulder cocktail dress with rouching, worn by a young Nigerian woman, photo realistic, studio lighting, white background, asymmetrical design, 8K"
  },

  // Outerwear
  { 
    value: "trench-coat-classic-beige", 
    label: "Trench Coat (Classic Beige)", 
    category: "outerwear", 
    subcategory: "coats", 
    keywords: ["classic", "water-resistant", "timeless"],
    detailedPrompt: "Classic beige double-breasted trench coat with belt, worn by a young Nigerian woman, photo realistic, studio lighting, white background, water-resistant gabardine, 8K"
  },
  { 
    value: "pea-coat-navy-wool", 
    label: "Pea Coat (Navy Wool)", 
    category: "outerwear", 
    subcategory: "coats", 
    keywords: ["naval", "double-breasted", "warm"],
    detailedPrompt: "Navy wool double-breasted pea coat with anchor buttons, worn by a young Nigerian man, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "denim-jacket", 
    label: "Denim Jacket", 
    category: "outerwear", 
    subcategory: "jackets", 
    keywords: ["casual", "versatile", "classic"],
    detailedPrompt: "Medium wash classic denim jacket, worn by a young Nigerian woman, photo realistic, studio lighting, white background, slight distressing, 8K"
  },
  { 
    value: "leather-biker-jacket", 
    label: "Leather Biker Jacket", 
    category: "outerwear", 
    subcategory: "jackets", 
    keywords: ["edgy", "rebellious", "durable"],
    detailedPrompt: "Black leather biker jacket with asymmetrical zip and silver hardware, worn by a young Nigerian man, photo realistic, studio lighting, white background, worn-in look, 8K"
  },
  { 
    value: "bomber-jacket-nylon", 
    label: "Bomber Jacket (Nylon)", 
    category: "outerwear", 
    subcategory: "jackets", 
    keywords: ["sporty", "casual", "lightweight"],
    detailedPrompt: "Olive green MA-1 style nylon bomber jacket with orange lining, worn by a young Nigerian man, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "parka-hooded", 
    label: "Parka (Hooded)", 
    category: "outerwear", 
    subcategory: "parkas", 
    keywords: ["warm", "hooded", "winter"],
    detailedPrompt: "Khaki hooded parka with faux fur trim, worn by a young Nigerian woman, photo realistic, studio lighting, white background, insulated for cold weather, 8K"
  },
  { 
    value: "blazer-tailored-wool", 
    label: "Blazer (Tailored Wool)", 
    category: "outerwear", 
    subcategory: "blazers", 
    keywords: ["professional", "structured", "formal"],
    detailedPrompt: "Charcoal grey single-breasted tailored wool blazer, worn by a young Nigerian man, smart business wear, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "raincoat-yellow", 
    label: "Raincoat (Yellow)", 
    category: "outerwear", 
    subcategory: "rainwear", 
    keywords: ["waterproof", "bright", "protective"],
    detailedPrompt: "Bright yellow hooded raincoat, worn by a young Nigerian woman, photo realistic, studio lighting, white background, waterproof material, 8K"
  },
  { 
    value: "puffer-jacket-down-filled", 
    label: "Puffer Jacket (Down-filled)", 
    category: "outerwear", 
    subcategory: "jackets", 
    keywords: ["quilted", "warm", "puffy"],
    detailedPrompt: "Black down-filled puffer jacket with a quilted design, worn by a young Nigerian woman, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "vest-quilted", 
    label: "Vest (Quilted)", 
    category: "outerwear", 
    subcategory: "vests", 
    keywords: ["layering", "lightweight", "sleeveless"],
    detailedPrompt: "Navy blue quilted vest, worn by a young Nigerian man as a lightweight layering piece, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "anorak-jacket", 
    label: "Anorak Jacket", 
    category: "outerwear", 
    subcategory: "jackets", 
    keywords: ["pullover", "hooded", "windproof"],
    detailedPrompt: "Red lightweight pull-over anorak jacket with a front pocket, worn by a young Nigerian man, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "duster-coat", 
    label: "Duster Coat", 
    category: "outerwear", 
    subcategory: "coats", 
    keywords: ["long", "flowing", "lightweight"],
    detailedPrompt: "Lightweight grey marl longline duster coat, worn open by a young Nigerian woman, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "cape-coat", 
    label: "Cape Coat", 
    category: "outerwear", 
    subcategory: "coats", 
    keywords: ["dramatic", "elegant", "flowing"],
    detailedPrompt: "Camel wool cape coat with arm slits, worn by a young Nigerian woman, elegant and dramatic, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "fleece-jacket", 
    label: "Fleece Jacket", 
    category: "outerwear", 
    subcategory: "jackets", 
    keywords: ["soft", "warm", "casual"],
    detailedPrompt: "Navy blue polar fleece jacket with a zip front, worn by a young Nigerian man, photo realistic, studio lighting, white background, soft texture, 8K"
  },
  { 
    value: "windbreaker", 
    label: "Windbreaker", 
    category: "outerwear", 
    subcategory: "jackets", 
    keywords: ["lightweight", "wind-resistant", "athletic"],
    detailedPrompt: "Color-blocked nylon windbreaker in a retro 90s style, worn by a young Nigerian model, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "sport-coat-blazer-linen", 
    label: "Sport Coat/Blazer (Linen)", 
    category: "outerwear", 
    subcategory: "blazers", 
    keywords: ["summer", "lightweight", "breathable"],
    detailedPrompt: "Light blue unlined linen sport coat, worn by a young Nigerian man, summer wear, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "overcoat-wool-cashmere", 
    label: "Overcoat (Wool Cashmere Blend)", 
    category: "outerwear", 
    subcategory: "coats", 
    keywords: ["formal", "luxurious", "warm"],
    detailedPrompt: "Black wool cashmere blend formal overcoat, worn by a young Nigerian man, knee-length, photo realistic, studio lighting, white background, luxurious, 8K"
  },
  { 
    value: "shearling-coat", 
    label: "Shearling Coat", 
    category: "outerwear", 
    subcategory: "coats", 
    keywords: ["cozy", "warm", "textured"],
    detailedPrompt: "Brown suede shearling coat with cream wool lining, worn by a young Nigerian woman, photo realistic, studio lighting, white background, cozy and warm, 8K"
  },
  { 
    value: "varsity-jacket", 
    label: "Varsity Jacket", 
    category: "outerwear", 
    subcategory: "jackets", 
    keywords: ["sporty", "collegiate", "retro"],
    detailedPrompt: "Blue and white wool varsity jacket with leather sleeves and chenille patches, worn by a young Nigerian model, collegiate style, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "field-jacket-m65", 
    label: "Field Jacket (M-65 style)", 
    category: "outerwear", 
    subcategory: "military", 
    keywords: ["military", "utility", "pockets"],
    detailedPrompt: "Olive drab M-65 style field jacket with multiple front pockets, worn by a young Nigerian man, military inspired, photo realistic, studio lighting, white background, 8K"
  },

  // Nigerian Contemporary Fashion - Pan-Nigerian & General Styles
  { 
    value: "ankara-print-jumpsuit", 
    label: "Ankara Print Jumpsuit", 
    category: "nigerian", 
    subcategory: "jumpsuits", 
    keywords: ["african", "vibrant", "stylish", "bold"],
    detailedPrompt: "A stylish women's Ankara print jumpsuit with a bold, vibrant pattern, worn by a young Nigerian woman, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "mens-senator-wear-kaftan", 
    label: "Men's Senator Wear (Kaftan)", 
    category: "nigerian", 
    subcategory: "traditional", 
    keywords: ["traditional", "formal", "embroidery", "nigerian"],
    detailedPrompt: "A modern men's navy blue two-piece Senator-style kaftan with subtle embroidery, worn by a young Nigerian man, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "fitted-agbada", 
    label: "Fitted Agbada", 
    category: "nigerian", 
    subcategory: "traditional", 
    keywords: ["formal", "contemporary", "fitted", "embroidery"],
    detailedPrompt: "A contemporary men's fitted Agbada in charcoal grey cashmere wool, with minimalist silver embroidery, worn by a young Nigerian man, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "womens-agbada", 
    label: "Women's Agbada", 
    category: "nigerian", 
    subcategory: "traditional", 
    keywords: ["fashionable", "feminine", "silk", "contemporary"],
    detailedPrompt: "A fashionable women's Agbada made from purple silk with a shorter feminine cut, worn by a young Nigerian woman, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "ankara-maxi-gown", 
    label: "Ankara Maxi Gown", 
    category: "nigerian", 
    subcategory: "dresses", 
    keywords: ["flowing", "maxi", "off-shoulder", "african"],
    detailedPrompt: "A flowing, floor-length Ankara maxi gown with an off-the-shoulder cut, worn by a young Nigerian woman, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "dashiki-modern", 
    label: "Dashiki (Modern)", 
    category: "nigerian", 
    subcategory: "shirts", 
    keywords: ["unisex", "colorful", "african", "traditional"],
    detailedPrompt: "A modern unisex Dashiki shirt in a bold blue and orange Angelina print, worn by a young Nigerian model, photo realistic, studio lighting, white background, 8K."
  },

  // Nigerian Contemporary Fashion - Yoruba Styles
  { 
    value: "modern-iro-and-buba", 
    label: "Modern Iro and Buba", 
    category: "nigerian", 
    subcategory: "yoruba", 
    keywords: ["yoruba", "traditional", "lace", "blouse", "wrapper"],
    detailedPrompt: "A modern Yoruba Iro and Buba outfit in emerald green lace, worn by a young Nigerian woman, featuring a fitted blouse and wrapper skirt, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "oleku-style", 
    label: "Oleku Style", 
    category: "nigerian", 
    subcategory: "yoruba", 
    keywords: ["retro", "yoruba", "aso-oke", "traditional"],
    detailedPrompt: "A retro Yoruba Oleku outfit made from Aso Oke fabric, worn by a young Nigerian woman, featuring a short-sleeved blouse and knee-length wrapper, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "aso-oke-blazer", 
    label: "Aso Oke Blazer", 
    category: "nigerian", 
    subcategory: "yoruba", 
    keywords: ["contemporary", "tailored", "aso-oke", "woven"],
    detailedPrompt: "A contemporary tailored blazer made from intricately woven Aso Oke fabric, worn by a young Nigerian model, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "gele-headwrap", 
    label: "Gele (Headwrap)", 
    category: "nigerian", 
    subcategory: "accessories", 
    keywords: ["headwrap", "elaborate", "gold", "nigerian"],
    detailedPrompt: "An elaborately styled Nigerian Gele headwrap in shimmering gold fabric, worn by a young Nigerian woman, photo-realistic, studio lighting, plain white background, 8K."
  },

  // Nigerian Contemporary Fashion - Igbo Styles
  { 
    value: "isiagu-tunic", 
    label: "Isiagu Tunic", 
    category: "nigerian", 
    subcategory: "igbo", 
    keywords: ["men's", "velvet", "embroidery", "lion-head"],
    detailedPrompt: "A men's black velvet Isiagu tunic with gold lion head embroidery, worn by a young Nigerian man, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "womens-isiagu-gown", 
    label: "Women's Isiagu Gown", 
    category: "nigerian", 
    subcategory: "igbo", 
    keywords: ["women's", "modern", "lion-head", "motifs"],
    detailedPrompt: "A modern women's gown made from red Isiagu fabric with lion head motifs, worn by a young Nigerian woman, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "george-wrapper-and-blouse", 
    label: "George Wrapper and Blouse", 
    category: "nigerian", 
    subcategory: "igbo", 
    keywords: ["luxurious", "embroidery", "lace", "wrapper"],
    detailedPrompt: "A luxurious Igbo women's outfit: a George wrapper with heavy embroidery paired with a modern lace blouse, worn by a young Nigerian woman, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "nze-coral-beads", 
    label: "Nze Coral Beads", 
    category: "nigerian", 
    subcategory: "accessories", 
    keywords: ["chieftaincy", "coral", "beads", "traditional"],
    detailedPrompt: "A multi-layered Nigerian chieftaincy coral bead necklace and cap, worn by a young Nigerian man, photo-realistic, studio lighting, plain white background, 8K."
  },

  // Nigerian Contemporary Fashion - Hausa-Fulani Styles
  { 
    value: "modern-babban-riga", 
    label: "Modern Babban Riga", 
    category: "nigerian", 
    subcategory: "hausa", 
    keywords: ["men's", "flowing", "embroidery", "hausa"],
    detailedPrompt: "A men's Hausa Babban Riga, a large flowing gown in white cotton with complex modern embroidery, worn by a young Nigerian man, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "atamfa-ankara-skirt-blouse", 
    label: "Atamfa (Ankara) Skirt and Blouse", 
    category: "nigerian", 
    subcategory: "hausa", 
    keywords: ["hausa", "ankara", "skirt", "peplum"],
    detailedPrompt: "A Hausa woman's outfit: a long Ankara (Atamfa) skirt and matching peplum blouse, worn by a young Nigerian woman, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "embroidered-hula-cap", 
    label: "Embroidered Hula (Cap)", 
    category: "nigerian", 
    subcategory: "accessories", 
    keywords: ["circular", "embroidered", "hausa", "cap"],
    detailedPrompt: "A circular, intricately embroidered Hausa Hula cap, worn by a young Nigerian man, photo-realistic, studio lighting, plain white background, 8K."
  },

  // Nigerian Contemporary Fashion - Niger-Delta Styles
  { 
    value: "mens-etibo-outfit", 
    label: "Men's Etibo Outfit", 
    category: "nigerian", 
    subcategory: "niger-delta", 
    keywords: ["formal", "white-shirt", "wrapper", "bowler-hat"],
    detailedPrompt: "A Niger-Delta men's formal Etibo outfit: a long-sleeved white shirt over a red George wrapper, worn by a young Nigerian man with a bowler hat, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "onyonyo-gown", 
    label: "Onyonyo Gown", 
    category: "nigerian", 
    subcategory: "niger-delta", 
    keywords: ["efik", "victorian", "flowing", "traditional"],
    detailedPrompt: "An Efik women's traditional Onyonyo, a flowing Victorian-style gown in light blue silk, worn by a young Nigerian woman, photo-realistic, studio lighting, plain white background, 8K."
  },
  { 
    value: "efik-bridal-regalia", 
    label: "Efik Bridal Regalia", 
    category: "nigerian", 
    subcategory: "niger-delta", 
    keywords: ["elaborate", "bridal", "beaded", "brass"],
    detailedPrompt: "An elaborate Efik bridal outfit with a beaded tube top and short wrapper skirt, worn by a young Nigerian bride with brass hairpins, photo-realistic, studio lighting, plain white background, 8K."
  },

  // More Global Styles - Fashion Styles
  { 
    value: "minimalist-fashion", 
    label: "Minimalist Fashion", 
    category: "styles", 
    subcategory: "minimalist", 
    keywords: ["clean", "oversized-blazer", "tailored", "neutral"],
    detailedPrompt: "Minimalist outfit on a young Nigerian model: cream oversized blazer, white t-shirt, black tailored trousers, photo realistic, full body shot, studio lighting, white background, clean lines, 8K"
  },
  { 
    value: "bohemian-boho-fashion", 
    label: "Bohemian (Boho) Fashion", 
    category: "styles", 
    subcategory: "bohemian", 
    keywords: ["flowy", "maxi-dress", "vest", "earthy"],
    detailedPrompt: "Bohemian style on a young Nigerian model: flowy floral maxi dress, fringed suede vest, photo realistic, full body shot, studio lighting, white background, earthy tones, 8K"
  },
  { 
    value: "vintage-1950s-fashion", 
    label: "Vintage (1950s) Fashion", 
    category: "styles", 
    subcategory: "vintage", 
    keywords: ["polka-dot", "swing-dress", "retro", "classic"],
    detailedPrompt: "1950s vintage fashion on a young Nigerian woman: polka dot swing dress with a crinoline, photo realistic, full body shot, studio lighting, white background, classic Americana, 8K"
  },
  { 
    value: "grunge-fashion", 
    label: "Grunge Fashion", 
    category: "styles", 
    subcategory: "grunge", 
    keywords: ["ripped", "flannel", "band-tshirt", "combat-boots"],
    detailedPrompt: "Grunge fashion on a young Nigerian model: ripped jeans, oversized plaid flannel shirt over a band t-shirt, combat boots, photo realistic, full body shot, studio lighting, white background, 90s inspired, 8K"
  },
  { 
    value: "preppy-fashion", 
    label: "Preppy Fashion", 
    category: "styles", 
    subcategory: "preppy", 
    keywords: ["navy-blazer", "chinos", "loafers", "ivy-league"],
    detailedPrompt: "Preppy fashion on a young Nigerian model: navy blazer, white collared shirt, khaki chinos, loafers, photo realistic, full body shot, studio lighting, white background, Ivy League style, 8K"
  },
  { 
    value: "athleisure-wear", 
    label: "Athleisure Wear", 
    category: "styles", 
    subcategory: "athleisure", 
    keywords: ["sporty", "hoodie", "joggers", "sneakers"],
    detailedPrompt: "Athleisure outfit on a young Nigerian model: matching hoodie and joggers set, stylish sneakers, photo realistic, full body shot, studio lighting, white background, comfortable and chic, 8K"
  },
  { 
    value: "streetwear-fashion", 
    label: "Streetwear Fashion", 
    category: "styles", 
    subcategory: "streetwear", 
    keywords: ["urban", "graphic-hoodie", "cargo", "sneakers"],
    detailedPrompt: "Streetwear fashion on a young Nigerian model: graphic hoodie, cargo pants, limited edition sneakers, beanie, photo realistic, full body shot, studio lighting, white background, urban style, 8K"
  },
  { 
    value: "punk-rock-fashion", 
    label: "Punk Rock Fashion", 
    category: "styles", 
    subcategory: "punk", 
    keywords: ["leather-jacket", "studs", "ripped", "rebellious"],
    detailedPrompt: "Punk rock fashion on a young Nigerian model: leather jacket with studs, ripped band t-shirt, tartan trousers, photo realistic, full body shot, studio lighting, white background, rebellious aesthetic, 8K"
  },
  { 
    value: "gothic-fashion", 
    label: "Gothic Fashion", 
    category: "styles", 
    subcategory: "gothic", 
    keywords: ["black-velvet", "lace", "platform-boots", "dramatic"],
    detailedPrompt: "Gothic fashion on a young Nigerian woman: black velvet long dress with lace details, platform boots, photo realistic, full body shot, studio lighting, white background, dramatic and dark, 8K"
  },
  { 
    value: "cyberpunk-fashion", 
    label: "Cyberpunk Fashion", 
    category: "styles", 
    subcategory: "cyberpunk", 
    keywords: ["futuristic", "led-accents", "tech-wear", "neon"],
    detailedPrompt: "Cyberpunk fashion on a young Nigerian model: futuristic jacket with LED accents, tech-wear pants, photo realistic, full body shot, studio lighting, white background, neon highlights, 8K"
  },
  { 
    value: "steampunk-fashion", 
    label: "Steampunk Fashion", 
    category: "styles", 
    subcategory: "steampunk", 
    keywords: ["victorian", "corset", "goggles", "gears"],
    detailedPrompt: "Steampunk fashion on a young Nigerian model: Victorian-inspired outfit with corset, goggles, and gear embellishments, photo realistic, full body shot, studio lighting, white background, 8K"
  },
  { 
    value: "coastal-grandmother-style", 
    label: "Coastal Grandmother Style", 
    category: "styles", 
    subcategory: "coastal", 
    keywords: ["linen-shirt", "wide-leg", "straw-hat", "relaxed"],
    detailedPrompt: "Coastal Grandmother style on a young Nigerian woman: cream linen shirt, white wide-leg pants, straw hat, photo realistic, full body shot, studio lighting, white background, relaxed elegance, 8K"
  },
  { 
    value: "y2k-fashion", 
    label: "Y2K Fashion", 
    category: "styles", 
    subcategory: "y2k", 
    keywords: ["low-rise", "baby-tee", "butterfly", "nostalgia"],
    detailedPrompt: "Y2K fashion on a young Nigerian woman: low-rise jeans, a baby tee with a butterfly print, photo realistic, full body shot, studio lighting, white background, early 2000s nostalgia, 8K"
  },
  { 
    value: "academia-dark-light-fashion", 
    label: "Academia (Dark/Light) Fashion", 
    category: "styles", 
    subcategory: "academia", 
    keywords: ["tweed-blazer", "turtleneck", "pleated-skirt", "literature"],
    detailedPrompt: "Dark Academia fashion on a young Nigerian model: tweed blazer, turtleneck sweater, pleated skirt, photo realistic, full body shot, studio lighting, white background, classic literature inspired, 8K"
  },
  { 
    value: "cottagecore-fashion", 
    label: "Cottagecore Fashion", 
    category: "styles", 
    subcategory: "cottagecore", 
    keywords: ["gingham", "prairie-dress", "embroidered", "rural"],
    detailedPrompt: "Cottagecore fashion on a young Nigerian woman: a gingham prairie dress, embroidered cardigan, photo realistic, full body shot, studio lighting, white background, romanticized rural life, 8K"
  },

  // Accessories & Smaller Garments
  { 
    value: "scarf-silk-square", 
    label: "Scarf (Silk Square)", 
    category: "accessories", 
    subcategory: "scarves", 
    keywords: ["printed", "silk", "vibrant", "elegant"],
    detailedPrompt: "A printed silk square scarf with vibrant colors, worn elegantly around the neck of a young Nigerian woman, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "beanie-hat", 
    label: "Beanie Hat", 
    category: "accessories", 
    subcategory: "hats", 
    keywords: ["ribbed", "knit", "soft", "wool"],
    detailedPrompt: "A grey ribbed knit beanie hat, worn by a young Nigerian model, photo realistic, studio lighting, white background, soft wool, 8K"
  },
  { 
    value: "fedora-hat", 
    label: "Fedora Hat", 
    category: "accessories", 
    subcategory: "hats", 
    keywords: ["classic", "felt", "ribbon", "vintage"],
    detailedPrompt: "A classic brown felt fedora hat, worn by a young Nigerian model, photo realistic, studio lighting, white background, ribbon band detail, 8K"
  },
  { 
    value: "gloves-leather", 
    label: "Gloves (Leather)", 
    category: "accessories", 
    subcategory: "gloves", 
    keywords: ["driving", "perforated", "black", "leather"],
    detailedPrompt: "Black leather driving gloves, worn on the hands of a young Nigerian model, photo realistic, studio lighting, white background, perforated details, 8K"
  },
  { 
    value: "tights-opaque", 
    label: "Tights (Opaque)", 
    category: "accessories", 
    subcategory: "hosiery", 
    keywords: ["opaque", "matte", "black", "legs"],
    detailedPrompt: "Black opaque tights, worn by a young Nigerian woman, focusing on the legs, photo realistic, studio lighting, white background, matte finish, 8K"
  },
  { 
    value: "belt-leather", 
    label: "Belt (Leather)", 
    category: "accessories", 
    subcategory: "belts", 
    keywords: ["brown", "silver-buckle", "classic", "leather"],
    detailedPrompt: "A brown leather belt with a silver buckle, worn with chinos by a young Nigerian man, close-up shot, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "suspenders-braces", 
    label: "Suspenders/Braces", 
    category: "accessories", 
    subcategory: "suspenders", 
    keywords: ["navy", "leather", "classic", "vintage"],
    detailedPrompt: "Navy blue suspenders with leather detailing, worn by a young Nigerian man with a classic shirt, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "bow-tie", 
    label: "Bow Tie", 
    category: "accessories", 
    subcategory: "neckwear", 
    keywords: ["black-silk", "self-tie", "formal", "tuxedo"],
    detailedPrompt: "A black silk self-tie bow tie, worn by a young Nigerian man with a tuxedo, close-up on the collar, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "pocket-square", 
    label: "Pocket Square", 
    category: "accessories", 
    subcategory: "pocket-squares", 
    keywords: ["white-linen", "navy-border", "folded", "formal"],
    detailedPrompt: "A white linen pocket square with a navy border, neatly folded in the pocket of a blazer worn by a young Nigerian man, photo realistic, studio lighting, white background, 8K"
  },

  // Specialty & Niche
  { 
    value: "lab-coat", 
    label: "Lab Coat", 
    category: "uniforms", 
    subcategory: "medical", 
    keywords: ["white", "cotton", "professional", "scientist"],
    detailedPrompt: "A white cotton lab coat, worn by a young Nigerian scientist, photo realistic, studio lighting, white background, professional, 8K"
  },
  { 
    value: "scrubs-medical", 
    label: "Scrubs (Medical)", 
    category: "uniforms", 
    subcategory: "medical", 
    keywords: ["blue", "medical", "nurse", "comfortable"],
    detailedPrompt: "Blue medical scrubs, worn by a young Nigerian nurse, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "chefs-uniform", 
    label: "Chef's Uniform", 
    category: "uniforms", 
    subcategory: "culinary", 
    keywords: ["white", "double-breasted", "houndstooth", "professional"],
    detailedPrompt: "A white double-breasted chef's jacket and houndstooth pants, worn by a young Nigerian chef, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "ballet-leotard", 
    label: "Ballet Leotard", 
    category: "uniforms", 
    subcategory: "dance", 
    keywords: ["black", "classic", "ballerina", "fitted"],
    detailedPrompt: "A black classic ballet leotard, worn by a young Nigerian ballerina, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "equestrian-riding-jacket", 
    label: "Equestrian Riding Jacket", 
    category: "uniforms", 
    subcategory: "equestrian", 
    keywords: ["formal", "velvet-collar", "riding", "black"],
    detailedPrompt: "A black formal equestrian riding jacket with a velvet collar, worn by a young Nigerian rider, photo realistic, studio lighting, white background, 8K"
  },
  { 
    value: "academic-gown-graduation", 
    label: "Academic Gown (Graduation)", 
    category: "uniforms", 
    subcategory: "academic", 
    keywords: ["graduation", "mortarboard", "formal", "black"],
    detailedPrompt: "A black academic graduation gown and mortarboard cap, worn by a young Nigerian graduate, photo realistic, studio lighting, white background, 8K"
  },

  // Keep some existing items for categories that weren't covered
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
  { value: "jodhpurs-riding-breeches", label: "Jodhpurs/Riding Breeches", category: "bottoms", subcategory: "equestrian", keywords: ["equestrian", "fitted", "knee patches"] },
  { value: "evening-gown-velvet", label: "Evening Gown (Velvet)", category: "dresses", subcategory: "formal", keywords: ["luxurious", "formal", "rich texture"] },

  // Suits & Formal Wear
  { value: "two-piece-suit-mens-navy", label: "Two-Piece Suit (Men's, Navy)", category: "suits", subcategory: "mens-suits", keywords: ["formal", "business", "professional"] },
  { value: "three-piece-suit-mens-grey", label: "Three-Piece Suit (Men's, Grey)", category: "suits", subcategory: "mens-suits", keywords: ["formal", "waistcoat", "classic"] },
  { value: "tuxedo-mens-black-tie", label: "Tuxedo (Men's, Black Tie)", category: "suits", subcategory: "formal", keywords: ["formal", "evening", "elegant"] },
  { value: "womens-pant-suit-power", label: "Women's Pant Suit (Power Suit)", category: "suits", subcategory: "womens-suits", keywords: ["professional", "powerful", "business"] },
  { value: "skirt-suit-womens", label: "Skirt Suit (Women's)", category: "suits", subcategory: "womens-suits", keywords: ["professional", "feminine", "business"] },
  { value: "morning-suit-mens", label: "Morning Suit (Men's)", category: "suits", subcategory: "formal", keywords: ["formal", "daywear", "traditional"] },
  { value: "jumpsuit-formal", label: "Jumpsuit (Formal)", category: "suits", subcategory: "jumpsuits", keywords: ["elegant", "modern", "alternative"] },

  // Other categories...
  { value: "bridesmaid-dress", label: "Bridesmaid Dress", category: "dresses", subcategory: "formal", keywords: ["wedding", "formal", "elegant"] },
  { value: "wedding-dress-ball-gown", label: "Wedding Dress (Ball Gown)", category: "dresses", subcategory: "bridal", keywords: ["bridal", "formal", "princess"] },
  { value: "wedding-dress-mermaid", label: "Wedding Dress (Mermaid)", category: "dresses", subcategory: "bridal", keywords: ["bridal", "fitted", "elegant"] },
  { value: "wedding-dress-a-line", label: "Wedding Dress (A-Line)", category: "dresses", subcategory: "bridal", keywords: ["bridal", "classic", "timeless"] },
  { value: "flower-girl-dress", label: "Flower Girl Dress", category: "dresses", subcategory: "formal", keywords: ["wedding", "child", "formal"] },

  // Activewear
  { value: "sports-bra", label: "Sports Bra", category: "activewear", subcategory: "tops", keywords: ["supportive", "athletic", "comfortable"] },
  { value: "athletic-tank-top", label: "Athletic Tank Top", category: "activewear", subcategory: "tops", keywords: ["moisture-wicking", "athletic", "breathable"] },
  { value: "compression-shorts", label: "Compression Shorts", category: "activewear", subcategory: "bottoms", keywords: ["compression", "athletic", "fitted"] },
  { value: "gym-shorts", label: "Gym Shorts", category: "activewear", subcategory: "bottoms", keywords: ["athletic", "comfortable", "breathable"] },
  { value: "tracksuit", label: "Tracksuit", category: "activewear", subcategory: "sets", keywords: ["athletic", "matching", "comfortable"] },
  { value: "windsuit", label: "Windsuit", category: "activewear", subcategory: "sets", keywords: ["wind-resistant", "athletic", "lightweight"] },

  // Traditional Clothing (continued)
  { value: "kimono-traditional", label: "Kimono (Traditional)", category: "traditional", subcategory: "japanese", keywords: ["silk", "traditional", "ceremonial"] },
  { value: "sari", label: "Sari", category: "traditional", subcategory: "indian", keywords: ["silk", "traditional", "elegant"] },
  { value: "lehenga", label: "Lehenga", category: "traditional", subcategory: "indian", keywords: ["formal", "traditional", "embroidered"] },
  { value: "cheongsam-qipao", label: "Cheongsam/Qipao", category: "traditional", subcategory: "chinese", keywords: ["silk", "fitted", "traditional"] },
  { value: "hanbok", label: "Hanbok", category: "traditional", subcategory: "korean", keywords: ["traditional", "colorful", "ceremonial"] },
  { value: "dirndl", label: "Dirndl", category: "traditional", subcategory: "german", keywords: ["traditional", "folk", "festival"] },
  { value: "kilt", label: "Kilt", category: "traditional", subcategory: "scottish", keywords: ["plaid", "traditional", "ceremonial"] },
];

// Utility functions
export const searchClothingItems = (query: string): ClothingItem[] => {
  const searchTerm = query.toLowerCase();
  return clothingItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm) ||
    item.subcategory?.toLowerCase().includes(searchTerm) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
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
