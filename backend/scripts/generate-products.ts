import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProductsService } from '../src/modules/products/products.service';
import { CategoriesService } from '../src/modules/categories/categories.service';

// Product data templates organized by subcategory
const productTemplates = {
  // Electronics
  'Smartphones': [
    { title: 'iPhone 15 Pro Max', description: 'Latest Apple smartphone with advanced camera system and A17 Pro chip', price: 1199.99, weight: 0.22 },
    { title: 'Samsung Galaxy S24 Ultra', description: 'Premium Android smartphone with S Pen and 200MP camera', price: 1299.99, weight: 0.23 },
    { title: 'Google Pixel 8 Pro', description: 'AI-powered smartphone with exceptional photography capabilities', price: 999.99, weight: 0.21 },
    { title: 'OnePlus 12', description: 'Flagship smartphone with fast charging and smooth performance', price: 799.99, weight: 0.22 },
    { title: 'Xiaomi 14 Ultra', description: 'Photography-focused smartphone with Leica camera system', price: 899.99, weight: 0.22 }
  ],
  'Laptops & Computers': [
    { title: 'MacBook Pro 16-inch M3', description: 'Professional laptop with M3 chip and Liquid Retina XDR display', price: 2499.99, weight: 2.14 },
    { title: 'Dell XPS 13 Plus', description: 'Ultra-portable laptop with InfinityEdge display', price: 1299.99, weight: 1.24 },
    { title: 'ThinkPad X1 Carbon Gen 11', description: 'Business laptop with military-grade durability', price: 1899.99, weight: 1.12 },
    { title: 'ASUS ROG Zephyrus G16', description: 'Gaming laptop with RTX 4070 and 240Hz display', price: 2199.99, weight: 1.95 },
    { title: 'HP Spectre x360 14', description: 'Convertible laptop with OLED touchscreen', price: 1499.99, weight: 1.39 }
  ],
  'Audio & Headphones': [
    { title: 'Sony WH-1000XM5', description: 'Premium noise-canceling wireless headphones', price: 399.99, weight: 0.25 },
    { title: 'AirPods Pro 2nd Gen', description: 'Apple wireless earbuds with active noise cancellation', price: 249.99, weight: 0.05 },
    { title: 'Bose QuietComfort 45', description: 'Comfortable noise-canceling headphones for travel', price: 329.99, weight: 0.24 },
    { title: 'Sennheiser HD 660S2', description: 'Open-back audiophile headphones', price: 599.99, weight: 0.26 },
    { title: 'JBL Charge 5', description: 'Portable Bluetooth speaker with powerbank feature', price: 179.99, weight: 0.96 }
  ],
  'Gaming': [
    { title: 'PlayStation 5', description: 'Next-generation gaming console with 4K gaming', price: 499.99, weight: 4.5 },
    { title: 'Xbox Series X', description: 'Powerful gaming console with Quick Resume feature', price: 499.99, weight: 4.45 },
    { title: 'Nintendo Switch OLED', description: 'Hybrid gaming console with vibrant OLED screen', price: 349.99, weight: 0.42 },
    { title: 'Steam Deck', description: 'Handheld gaming PC for Steam library', price: 649.99, weight: 0.67 },
    { title: 'ASUS ROG Ally', description: 'Windows handheld gaming device', price: 699.99, weight: 0.61 }
  ],
  'Smart Home': [
    { title: 'Amazon Echo Dot 5th Gen', description: 'Compact smart speaker with Alexa', price: 49.99, weight: 0.34 },
    { title: 'Google Nest Hub Max', description: 'Smart display with Google Assistant', price: 229.99, weight: 1.32 },
    { title: 'Philips Hue Starter Kit', description: 'Smart LED light bulbs with color changing', price: 199.99, weight: 0.8 },
    { title: 'Ring Video Doorbell Pro 2', description: 'Smart doorbell with 1536p video', price: 249.99, weight: 0.49 },
    { title: 'Nest Learning Thermostat', description: 'Smart thermostat that learns your schedule', price: 249.99, weight: 0.48 }
  ],
  'Cameras & Photography': [
    { title: 'Canon EOS R5', description: 'Professional mirrorless camera with 8K video', price: 3899.99, weight: 0.74 },
    { title: 'Sony A7 IV', description: 'Full-frame mirrorless camera for creators', price: 2499.99, weight: 0.66 },
    { title: 'Fujifilm X-T5', description: 'APS-C mirrorless camera with film simulations', price: 1699.99, weight: 0.56 },
    { title: 'DJI Mini 4 Pro', description: 'Compact drone with 4K HDR video', price: 759.99, weight: 0.25 },
    { title: 'GoPro Hero 12 Black', description: 'Action camera with HyperSmooth stabilization', price: 399.99, weight: 0.15 }
  ],

  // Clothing & Fashion
  "Men's Clothing": [
    { title: 'Levi\'s 501 Original Jeans', description: 'Classic straight-leg denim jeans', price: 89.99, weight: 0.7 },
    { title: 'Nike Dri-FIT T-Shirt', description: 'Moisture-wicking athletic t-shirt', price: 29.99, weight: 0.2 },
    { title: 'Patagonia Better Sweater', description: 'Fleece pullover made from recycled materials', price: 119.99, weight: 0.6 },
    { title: 'Adidas Ultraboost 22', description: 'Premium running shoes with Boost cushioning', price: 189.99, weight: 0.35 },
    { title: 'Ralph Lauren Polo Shirt', description: 'Classic cotton polo shirt', price: 89.99, weight: 0.25 }
  ],
  "Women's Clothing": [
    { title: 'Zara Midi Dress', description: 'Elegant midi dress for special occasions', price: 79.99, weight: 0.4 },
    { title: 'Lululemon Align Leggings', description: 'High-waisted yoga leggings', price: 128.99, weight: 0.25 },
    { title: 'H&M Oversized Blazer', description: 'Trendy oversized blazer for work or casual', price: 59.99, weight: 0.5 },
    { title: 'Nike Air Max 270', description: 'Comfortable lifestyle sneakers', price: 149.99, weight: 0.4 },
    { title: 'Uniqlo Cashmere Sweater', description: 'Soft cashmere pullover sweater', price: 99.99, weight: 0.3 }
  ],
  "Kids' Clothing": [
    { title: 'Gap Kids Denim Jacket', description: 'Classic denim jacket for children', price: 39.99, weight: 0.3 },
    { title: 'Carter\'s Pajama Set', description: 'Comfortable cotton pajamas for toddlers', price: 24.99, weight: 0.2 },
    { title: 'Nike Kids Air Force 1', description: 'Iconic sneakers in kids sizes', price: 69.99, weight: 0.25 },
    { title: 'Disney Princess Dress', description: 'Costume dress for imaginative play', price: 34.99, weight: 0.3 },
    { title: 'Old Navy Graphic Tee', description: 'Fun graphic t-shirt for kids', price: 12.99, weight: 0.15 }
  ],
  'Shoes': [
    { title: 'Converse Chuck Taylor All Star', description: 'Classic canvas sneakers', price: 59.99, weight: 0.6 },
    { title: 'Dr. Martens 1460 Boots', description: 'Iconic leather ankle boots', price: 169.99, weight: 1.2 },
    { title: 'Allbirds Tree Runners', description: 'Sustainable sneakers made from eucalyptus', price: 98.99, weight: 0.35 },
    { title: 'Vans Old Skool', description: 'Classic skate shoes with side stripe', price: 64.99, weight: 0.5 },
    { title: 'Birkenstock Arizona Sandals', description: 'Comfortable cork footbed sandals', price: 139.99, weight: 0.4 }
  ],
  'Accessories': [
    { title: 'Ray-Ban Aviator Sunglasses', description: 'Classic pilot-style sunglasses', price: 179.99, weight: 0.03 },
    { title: 'Apple Watch Series 9', description: 'Advanced smartwatch with health tracking', price: 399.99, weight: 0.04 },
    { title: 'Fossil Leather Wallet', description: 'Genuine leather bifold wallet', price: 49.99, weight: 0.1 },
    { title: 'Pandora Charm Bracelet', description: 'Sterling silver charm bracelet', price: 89.99, weight: 0.02 },
    { title: 'Casio G-Shock Watch', description: 'Durable digital sports watch', price: 129.99, weight: 0.07 }
  ],
  'Bags & Luggage': [
    { title: 'Samsonite Carry-On Luggage', description: 'Lightweight hardside carry-on suitcase', price: 199.99, weight: 2.8 },
    { title: 'Herschel Little America Backpack', description: 'Classic mountaineering-inspired backpack', price: 119.99, weight: 0.8 },
    { title: 'Coach Leather Handbag', description: 'Premium leather shoulder bag', price: 349.99, weight: 0.6 },
    { title: 'Patagonia Black Hole Duffel', description: 'Weather-resistant travel duffel bag', price: 149.99, weight: 1.1 },
    { title: 'Tumi Alpha Bravo Backpack', description: 'Professional laptop backpack', price: 295.99, weight: 1.2 }
  ],

  // Home & Garden
  'Furniture': [
    { title: 'IKEA MALM Bed Frame', description: 'Modern wooden bed frame with storage', price: 299.99, weight: 45.0 },
    { title: 'West Elm Mid-Century Sofa', description: 'Stylish 3-seater sofa with wooden legs', price: 1299.99, weight: 68.0 },
    { title: 'Herman Miller Aeron Chair', description: 'Ergonomic office chair with mesh back', price: 1395.99, weight: 21.0 },
    { title: 'CB2 Acrylic Coffee Table', description: 'Modern transparent acrylic coffee table', price: 599.99, weight: 25.0 },
    { title: 'Article Sven Dining Table', description: 'Solid wood dining table for 6 people', price: 899.99, weight: 55.0 }
  ],
  'Kitchen & Dining': [
    { title: 'KitchenAid Stand Mixer', description: 'Professional 5-quart stand mixer', price: 449.99, weight: 11.0 },
    { title: 'Instant Pot Duo 7-in-1', description: 'Multi-functional pressure cooker', price: 99.99, weight: 5.8 },
    { title: 'Cuisinart Food Processor', description: '14-cup food processor with multiple blades', price: 199.99, weight: 8.5 },
    { title: 'All-Clad Stainless Steel Cookware Set', description: 'Professional 10-piece cookware set', price: 699.99, weight: 15.0 },
    { title: 'Nespresso Vertuo Coffee Maker', description: 'Single-serve coffee and espresso maker', price: 199.99, weight: 4.2 }
  ],
  'Bedding & Bath': [
    { title: 'Brooklinen Percale Sheet Set', description: 'Crisp and cool cotton percale sheets', price: 149.99, weight: 1.5 },
    { title: 'Parachute Down Alternative Comforter', description: 'Hypoallergenic all-season comforter', price: 249.99, weight: 2.8 },
    { title: 'Casper Foam Pillow', description: 'Memory foam pillow with cooling gel', price: 89.99, weight: 1.2 },
    { title: 'Turkish Cotton Bath Towel Set', description: 'Luxury 6-piece bath towel set', price: 79.99, weight: 2.0 },
    { title: 'Bamboo Shower Curtain', description: 'Eco-friendly waterproof shower curtain', price: 39.99, weight: 0.8 }
  ],
  'Home Decor': [
    { title: 'Anthropologie Ceramic Vase', description: 'Handcrafted ceramic vase with unique glaze', price: 89.99, weight: 1.5 },
    { title: 'West Elm Abstract Wall Art', description: 'Modern abstract canvas print', price: 199.99, weight: 2.0 },
    { title: 'CB2 Brass Table Lamp', description: 'Mid-century modern brass table lamp', price: 149.99, weight: 3.2 },
    { title: 'Urban Outfitters Tapestry', description: 'Bohemian wall hanging tapestry', price: 49.99, weight: 0.5 },
    { title: 'Yankee Candle Large Jar', description: 'Long-burning scented candle', price: 29.99, weight: 0.65 }
  ],
  'Garden & Outdoor': [
    { title: 'Weber Genesis Gas Grill', description: 'Premium 3-burner gas grill with side burner', price: 899.99, weight: 75.0 },
    { title: 'Teak Outdoor Dining Set', description: '7-piece teak dining set for patio', price: 1599.99, weight: 120.0 },
    { title: 'Solar String Lights', description: 'Weather-resistant LED string lights', price: 39.99, weight: 0.8 },
    { title: 'Raised Garden Bed Kit', description: 'Cedar wood raised bed for vegetables', price: 149.99, weight: 25.0 },
    { title: 'Outdoor Fire Pit', description: 'Steel fire pit with cooking grate', price: 299.99, weight: 35.0 }
  ],
  'Tools & Hardware': [
    { title: 'DeWalt Cordless Drill Set', description: '20V MAX cordless drill with bits', price: 149.99, weight: 2.5 },
    { title: 'Craftsman Tool Box', description: '26-inch portable tool box with drawers', price: 89.99, weight: 8.0 },
    { title: 'Stanley Tape Measure', description: '25-foot measuring tape with magnetic tip', price: 19.99, weight: 0.4 },
    { title: 'Black+Decker Circular Saw', description: '7.25-inch circular saw for wood cutting', price: 79.99, weight: 3.8 },
    { title: 'Husky Socket Set', description: '230-piece mechanics tool set', price: 199.99, weight: 12.0 }
  ],

  // Sports & Outdoors
  'Fitness Equipment': [
    { title: 'Peloton Bike+', description: 'Interactive exercise bike with rotating screen', price: 2495.99, weight: 59.0 },
    { title: 'Bowflex Adjustable Dumbbells', description: 'Space-saving adjustable weight set', price: 549.99, weight: 23.0 },
    { title: 'NordicTrack Treadmill', description: 'Folding treadmill with iFit technology', price: 1299.99, weight: 85.0 },
    { title: 'Yoga Mat Premium', description: 'Non-slip yoga mat with alignment lines', price: 79.99, weight: 1.2 },
    { title: 'Resistance Bands Set', description: '11-piece resistance band workout kit', price: 29.99, weight: 1.5 }
  ],
  'Team Sports': [
    { title: 'Wilson Official NFL Football', description: 'Official size and weight football', price: 39.99, weight: 0.42 },
    { title: 'Spalding NBA Basketball', description: 'Official NBA game basketball', price: 59.99, weight: 0.62 },
    { title: 'Adidas Soccer Ball', description: 'FIFA-approved match soccer ball', price: 49.99, weight: 0.43 },
    { title: 'Rawlings Baseball Glove', description: 'Professional leather baseball glove', price: 149.99, weight: 0.7 },
    { title: 'Franklin Hockey Stick', description: 'Composite ice hockey stick', price: 89.99, weight: 0.52 }
  ],
  'Outdoor Recreation': [
    { title: 'REI Co-op Tent', description: '4-person backpacking tent with rainfly', price: 299.99, weight: 2.8 },
    { title: 'Patagonia Hiking Backpack', description: '65L backpacking pack with frame', price: 349.99, weight: 2.1 },
    { title: 'Coleman Sleeping Bag', description: 'Mummy sleeping bag rated to 20°F', price: 89.99, weight: 1.8 },
    { title: 'Jetboil Camping Stove', description: 'Compact camping stove with fuel canister', price: 119.99, weight: 0.45 },
    { title: 'Hydro Flask Water Bottle', description: '32oz insulated stainless steel bottle', price: 44.99, weight: 0.35 }
  ],
  'Water Sports': [
    { title: 'BOTE Inflatable Paddleboard', description: '10.5ft inflatable SUP with paddle', price: 599.99, weight: 8.5 },
    { title: 'Speedo Competition Swimsuit', description: 'Performance swimsuit for competitive swimming', price: 89.99, weight: 0.2 },
    { title: 'O\'Neill Wetsuit', description: '3/2mm full wetsuit for surfing', price: 199.99, weight: 1.5 },
    { title: 'Aqua Lung Snorkel Set', description: 'Mask, snorkel, and fins set', price: 79.99, weight: 1.2 },
    { title: 'Pelican Kayak', description: '10ft recreational kayak with paddle', price: 449.99, weight: 22.0 }
  ],
  'Winter Sports': [
    { title: 'Rossignol Ski Set', description: 'All-mountain skis with bindings', price: 699.99, weight: 4.5 },
    { title: 'Burton Snowboard', description: 'Freestyle snowboard for all levels', price: 449.99, weight: 2.8 },
    { title: 'Smith Ski Helmet', description: 'MIPS protection ski helmet', price: 149.99, weight: 0.5 },
    { title: 'Oakley Ski Goggles', description: 'Anti-fog ski goggles with UV protection', price: 179.99, weight: 0.15 },
    { title: 'Columbia Ski Jacket', description: 'Waterproof insulated ski jacket', price: 299.99, weight: 1.2 }
  ],
  'Athletic Wear': [
    { title: 'Nike Pro Compression Shorts', description: 'Moisture-wicking compression shorts', price: 39.99, weight: 0.15 },
    { title: 'Under Armour HeatGear Shirt', description: 'Lightweight athletic t-shirt', price: 29.99, weight: 0.12 },
    { title: 'Lululemon Sports Bra', description: 'High-support sports bra for intense workouts', price: 68.99, weight: 0.08 },
    { title: 'Adidas Running Shorts', description: 'Lightweight running shorts with liner', price: 34.99, weight: 0.1 },
    { title: 'New Balance Running Shoes', description: 'Cushioned running shoes for daily training', price: 129.99, weight: 0.3 }
  ],

  // Books & Media
  'Fiction Books': [
    { title: 'The Seven Husbands of Evelyn Hugo', description: 'Captivating novel about a reclusive Hollywood icon', price: 16.99, weight: 0.4 },
    { title: 'Where the Crawdads Sing', description: 'Mystery and coming-of-age story set in the marshes', price: 15.99, weight: 0.45 },
    { title: 'The Midnight Library', description: 'Philosophical novel about life\'s infinite possibilities', price: 14.99, weight: 0.35 },
    { title: 'Project Hail Mary', description: 'Science fiction thriller about saving humanity', price: 17.99, weight: 0.5 },
    { title: 'The Silent Patient', description: 'Psychological thriller about a woman who refuses to speak', price: 15.99, weight: 0.4 }
  ],
  'Non-Fiction Books': [
    { title: 'Atomic Habits', description: 'Guide to building good habits and breaking bad ones', price: 18.99, weight: 0.45 },
    { title: 'Educated', description: 'Memoir about education and family in rural Idaho', price: 16.99, weight: 0.4 },
    { title: 'Sapiens', description: 'Brief history of humankind from stone age to present', price: 19.99, weight: 0.55 },
    { title: 'The Body Keeps the Score', description: 'Revolutionary book about trauma and recovery', price: 17.99, weight: 0.5 },
    { title: 'Becoming', description: 'Michelle Obama\'s inspiring memoir', price: 19.99, weight: 0.6 }
  ],
  'Movies & TV': [
    { title: 'Avengers: Endgame 4K Blu-ray', description: 'Epic conclusion to the Infinity Saga', price: 29.99, weight: 0.15 },
    { title: 'The Office Complete Series DVD', description: 'All 9 seasons of the beloved comedy series', price: 79.99, weight: 1.2 },
    { title: 'Parasite Criterion Blu-ray', description: 'Oscar-winning Korean thriller with special features', price: 39.99, weight: 0.2 },
    { title: 'Stranger Things Season 4 Blu-ray', description: 'Latest season of the hit Netflix series', price: 34.99, weight: 0.25 },
    { title: 'Top Gun: Maverick 4K', description: 'Action-packed sequel to the 1986 classic', price: 32.99, weight: 0.15 }
  ],
  'Music': [
    { title: 'Taylor Swift - Midnights Vinyl', description: 'Latest album from the pop superstar', price: 34.99, weight: 0.18 },
    { title: 'The Beatles - Abbey Road Remaster', description: 'Remastered version of the classic album', price: 24.99, weight: 0.15 },
    { title: 'Billie Eilish - Happier Than Ever CD', description: 'Second studio album from the young artist', price: 14.99, weight: 0.1 },
    { title: 'Pink Floyd - Dark Side of the Moon', description: 'Iconic progressive rock album on vinyl', price: 29.99, weight: 0.18 },
    { title: 'Adele - 30 Deluxe Edition', description: 'Grammy-winning album in deluxe packaging', price: 19.99, weight: 0.12 }
  ],
  'Video Games': [
    { title: 'The Legend of Zelda: Tears of the Kingdom', description: 'Epic adventure game for Nintendo Switch', price: 69.99, weight: 0.05 },
    { title: 'God of War Ragnarök', description: 'Norse mythology action-adventure for PlayStation', price: 59.99, weight: 0.05 },
    { title: 'Elden Ring', description: 'Fantasy action RPG from FromSoftware', price: 59.99, weight: 0.05 },
    { title: 'FIFA 24', description: 'Latest soccer simulation game', price: 69.99, weight: 0.05 },
    { title: 'Call of Duty: Modern Warfare III', description: 'First-person shooter with campaign and multiplayer', price: 69.99, weight: 0.05 }
  ],
  'Magazines': [
    { title: 'National Geographic Annual Subscription', description: '12 issues of the iconic nature magazine', price: 39.99, weight: 0.2 },
    { title: 'Vogue Fashion Magazine', description: 'Latest issue of the premier fashion magazine', price: 5.99, weight: 0.15 },
    { title: 'Scientific American Subscription', description: '12 issues of science and technology magazine', price: 49.99, weight: 0.18 },
    { title: 'Time Magazine Annual', description: 'Weekly news magazine subscription', price: 29.99, weight: 0.12 },
    { title: 'Wired Technology Magazine', description: 'Monthly technology and culture magazine', price: 19.99, weight: 0.15 }
  ],

  // Health & Beauty
  'Skincare': [
    { title: 'CeraVe Moisturizing Cream', description: 'Daily face and body moisturizer for dry skin', price: 19.99, weight: 0.45 },
    { title: 'The Ordinary Niacinamide Serum', description: 'Vitamin B3 serum for blemish-prone skin', price: 7.99, weight: 0.03 },
    { title: 'Neutrogena Hydrating Cleanser', description: 'Gentle foaming cleanser for all skin types', price: 12.99, weight: 0.2 },
    { title: 'La Roche-Posay Sunscreen SPF 60', description: 'Broad-spectrum mineral sunscreen', price: 34.99, weight: 0.05 },
    { title: 'Drunk Elephant Vitamin C Serum', description: 'Antioxidant serum for brightening skin', price: 80.99, weight: 0.03 }
  ],
  'Makeup & Cosmetics': [
    { title: 'Fenty Beauty Foundation', description: 'Full-coverage foundation in 50 shades', price: 39.99, weight: 0.03 },
    { title: 'Urban Decay Eyeshadow Palette', description: '12-shade eyeshadow palette with mirror', price: 54.99, weight: 0.15 },
    { title: 'MAC Ruby Woo Lipstick', description: 'Iconic red matte lipstick', price: 19.99, weight: 0.003 },
    { title: 'Maybelline Great Lash Mascara', description: 'Classic lengthening and separating mascara', price: 7.99, weight: 0.01 },
    { title: 'NARS Blush in Orgasm', description: 'Cult-favorite peachy pink blush', price: 38.99, weight: 0.005 }
  ],
  'Hair Care': [
    { title: 'Olaplex Hair Treatment', description: 'Bond-building treatment for damaged hair', price: 28.99, weight: 0.1 },
    { title: 'Moroccan Oil Hair Treatment', description: 'Argan oil treatment for shine and softness', price: 44.99, weight: 0.1 },
    { title: 'Pantene Pro-V Shampoo', description: 'Strengthening shampoo for weak hair', price: 6.99, weight: 0.4 },
    { title: 'Living Proof Dry Shampoo', description: 'Oil-absorbing dry shampoo spray', price: 29.99, weight: 0.2 },
    { title: 'Dyson Supersonic Hair Dryer', description: 'Professional hair dryer with heat control', price: 429.99, weight: 0.66 }
  ],
  'Personal Care': [
    { title: 'Dove Beauty Bar Soap', description: 'Moisturizing beauty bar for sensitive skin', price: 4.99, weight: 0.1 },
    { title: 'Oral-B Electric Toothbrush', description: 'Rechargeable toothbrush with pressure sensor', price: 89.99, weight: 0.15 },
    { title: 'Degree Antiperspirant Deodorant', description: '48-hour protection antiperspirant', price: 4.49, weight: 0.08 },
    { title: 'Gillette Fusion5 Razor', description: '5-blade razor with precision trimmer', price: 12.99, weight: 0.05 },
    { title: 'Johnson\'s Baby Lotion', description: 'Gentle moisturizing lotion for babies', price: 5.99, weight: 0.5 }
  ],
  'Vitamins & Supplements': [
    { title: 'Nature Made Vitamin D3', description: '2000 IU vitamin D3 softgels', price: 14.99, weight: 0.15 },
    { title: 'Centrum Multivitamin', description: 'Complete multivitamin for adults', price: 19.99, weight: 0.2 },
    { title: 'Omega-3 Fish Oil Capsules', description: 'Heart-healthy omega-3 fatty acids', price: 24.99, weight: 0.25 },
    { title: 'Probiotics Daily Supplement', description: '50 billion CFU probiotic capsules', price: 39.99, weight: 0.1 },
    { title: 'Magnesium Glycinate', description: 'Highly absorbable magnesium supplement', price: 22.99, weight: 0.18 }
  ],
  'Medical Supplies': [
    { title: 'First Aid Kit Complete', description: '299-piece first aid kit for home and travel', price: 49.99, weight: 1.2 },
    { title: 'Digital Thermometer', description: 'Fast and accurate digital thermometer', price: 12.99, weight: 0.05 },
    { title: 'Blood Pressure Monitor', description: 'Automatic upper arm blood pressure cuff', price: 79.99, weight: 0.8 },
    { title: 'Pulse Oximeter', description: 'Fingertip pulse oximeter for oxygen saturation', price: 29.99, weight: 0.06 },
    { title: 'Heating Pad Electric', description: 'Large heating pad with multiple heat settings', price: 34.99, weight: 0.9 }
  ],

  // Toys & Games
  'Action Figures': [
    { title: 'Marvel Spider-Man Figure', description: '12-inch articulated Spider-Man action figure', price: 24.99, weight: 0.3 },
    { title: 'Star Wars Darth Vader', description: 'Black Series 6-inch Darth Vader figure', price: 29.99, weight: 0.25 },
    { title: 'Transformers Optimus Prime', description: 'Converting robot to truck action figure', price: 34.99, weight: 0.5 },
    { title: 'DC Batman Figure', description: 'Detailed Batman figure with cape and accessories', price: 19.99, weight: 0.2 },
    { title: 'Pokemon Pikachu Plush', description: 'Soft and cuddly Pikachu stuffed animal', price: 14.99, weight: 0.15 }
  ],
  'Board Games': [
    { title: 'Monopoly Classic Edition', description: 'The classic property trading board game', price: 19.99, weight: 1.1 },
    { title: 'Settlers of Catan', description: 'Strategic board game of trading and building', price: 54.99, weight: 1.5 },
    { title: 'Ticket to Ride', description: 'Railway-themed board game for families', price: 49.99, weight: 1.2 },
    { title: 'Scrabble Deluxe Edition', description: 'Word game with rotating wooden board', price: 39.99, weight: 1.8 },
    { title: 'Azul Board Game', description: 'Beautiful tile-laying strategy game', price: 39.99, weight: 1.0 }
  ],
  'Educational Toys': [
    { title: 'LeapFrog Learning Tablet', description: 'Interactive tablet for preschool learning', price: 59.99, weight: 0.4 },
    { title: 'Melissa & Doug Wooden Puzzles', description: 'Set of 4 wooden jigsaw puzzles', price: 24.99, weight: 0.8 },
    { title: 'National Geographic Break Open Geodes', description: 'STEM kit for discovering real geodes', price: 29.99, weight: 1.5 },
    { title: 'VTech Kidizoom Camera', description: 'Kid-friendly digital camera with games', price: 49.99, weight: 0.3 },
    { title: 'Learning Resources Microscope', description: 'Kid-friendly microscope with specimens', price: 79.99, weight: 1.2 }
  ],
  'Dolls & Plush': [
    { title: 'Barbie Dreamhouse Doll', description: 'Classic Barbie doll with blonde hair', price: 12.99, weight: 0.1 },
    { title: 'American Girl Doll', description: '18-inch doll with historical backstory', price: 115.99, weight: 0.8 },
    { title: 'Teddy Bear Large', description: 'Soft and cuddly 24-inch teddy bear', price: 39.99, weight: 0.6 },
    { title: 'LOL Surprise Doll', description: 'Mystery doll with accessories and surprises', price: 14.99, weight: 0.15 },
    { title: 'Baby Alive Interactive Doll', description: 'Doll that eats, drinks, and talks', price: 49.99, weight: 0.9 }
  ],
  'Building Sets': [
    { title: 'LEGO Creator 3-in-1 Set', description: 'Building set that makes 3 different models', price: 79.99, weight: 1.2 },
    { title: 'K\'NEX Building Set', description: 'Rod and connector building system', price: 49.99, weight: 1.5 },
    { title: 'Magna-Tiles Clear Colors', description: 'Magnetic building tiles for creativity', price: 59.99, weight: 1.8 },
    { title: 'Lincoln Logs Classic Set', description: 'Traditional wooden log building set', price: 34.99, weight: 2.0 },
    { title: 'Playmobil Pirate Ship', description: 'Detailed pirate ship with figures', price: 89.99, weight: 2.5 }
  ],
  'Outdoor Toys': [
    { title: 'Razor A3 Kick Scooter', description: 'Lightweight aluminum kick scooter', price: 59.99, weight: 2.7 },
    { title: 'Nerf Elite Blaster', description: 'Foam dart blaster with 12-dart clip', price: 24.99, weight: 0.8 },
    { title: 'Spalding Basketball Hoop', description: 'Adjustable height basketball hoop system', price: 199.99, weight: 25.0 },
    { title: 'Slip \'N Slide Water Toy', description: '16-foot water slide for summer fun', price: 29.99, weight: 1.5 },
    { title: 'Pogo Stick for Kids', description: 'Foam-handled pogo stick for ages 5-9', price: 39.99, weight: 1.8 }
  ],

  // Automotive
  'Car Parts': [
    { title: 'Bosch Spark Plugs Set', description: 'Iridium spark plugs for improved performance', price: 39.99, weight: 0.2 },
    { title: 'Fram Oil Filter', description: 'High-quality oil filter for engine protection', price: 12.99, weight: 0.3 },
    { title: 'ACDelco Car Battery', description: '12V automotive battery with 3-year warranty', price: 149.99, weight: 18.0 },
    { title: 'Wagner Brake Pads', description: 'Ceramic brake pads for quiet stopping', price: 79.99, weight: 2.5 },
    { title: 'Michelin Wiper Blades', description: 'All-weather windshield wiper blades', price: 29.99, weight: 0.5 }
  ],
  'Car Accessories': [
    { title: 'WeatherTech Floor Mats', description: 'Custom-fit all-weather floor mats', price: 199.99, weight: 3.0 },
    { title: 'Garmin Dash Cam', description: 'HD dashboard camera with GPS', price: 199.99, weight: 0.15 },
    { title: 'Phone Mount for Car', description: 'Magnetic phone holder for dashboard', price: 24.99, weight: 0.2 },
    { title: 'Car Seat Covers', description: 'Universal fit seat covers for protection', price: 89.99, weight: 1.5 },
    { title: 'Bluetooth FM Transmitter', description: 'Wireless music streaming for older cars', price: 19.99, weight: 0.1 }
  ],
  'Tools & Equipment': [
    { title: 'Craftsman Socket Wrench Set', description: '165-piece mechanics tool set', price: 149.99, weight: 8.0 },
    { title: 'DEWALT Impact Driver', description: '20V MAX cordless impact driver', price: 129.99, weight: 1.4 },
    { title: 'OBD2 Scanner Tool', description: 'Diagnostic scanner for check engine lights', price: 79.99, weight: 0.3 },
    { title: 'Hydraulic Floor Jack', description: '3-ton capacity floor jack for cars', price: 199.99, weight: 35.0 },
    { title: 'Digital Tire Pressure Gauge', description: 'Accurate digital tire pressure reader', price: 19.99, weight: 0.2 }
  ],
  'Oils & Fluids': [
    { title: 'Mobil 1 Synthetic Oil', description: '5W-30 full synthetic motor oil 5-quart', price: 34.99, weight: 4.5 },
    { title: 'Prestone Antifreeze Coolant', description: 'Extended life antifreeze/coolant', price: 14.99, weight: 3.8 },
    { title: 'Lucas Transmission Fluid', description: 'High-performance automatic transmission fluid', price: 24.99, weight: 3.8 },
    { title: 'STP Brake Fluid DOT 3', description: 'High-quality brake fluid for safety', price: 8.99, weight: 0.35 },
    { title: 'Rain-X Windshield Washer Fluid', description: 'Bug remover windshield washer fluid', price: 3.99, weight: 3.8 }
  ],
  'Tires & Wheels': [
    { title: 'Michelin All-Season Tire', description: 'P225/60R16 all-season radial tire', price: 149.99, weight: 11.0 },
    { title: 'Goodyear Winter Tire', description: 'Snow tire for winter driving safety', price: 179.99, weight: 12.0 },
    { title: 'American Racing Wheels', description: '17-inch alloy wheels set of 4', price: 799.99, weight: 60.0 },
    { title: 'Tire Pressure Monitoring System', description: 'TPMS sensors for tire safety', price: 199.99, weight: 0.8 },
    { title: 'Wheel Spacers Kit', description: 'Hub-centric wheel spacers for wider stance', price: 89.99, weight: 2.0 }
  ],
  'Car Care': [
    { title: 'Meguiar\'s Car Wax', description: 'Premium carnauba car wax for shine', price: 19.99, weight: 0.4 },
    { title: 'Chemical Guys Soap', description: 'pH-balanced car wash soap concentrate', price: 14.99, weight: 0.5 },
    { title: 'Armor All Protectant', description: 'Dashboard and vinyl protectant spray', price: 7.99, weight: 0.5 },
    { title: 'Microfiber Towels Set', description: 'Ultra-soft microfiber cleaning cloths', price: 24.99, weight: 0.8 },
    { title: 'Turtle Wax Ice Spray', description: 'Spray wax for quick shine and protection', price: 12.99, weight: 0.6 }
  ],

  // Food & Beverages
  'Fresh Produce': [
    { title: 'Organic Bananas', description: 'Fresh organic bananas - 2 lb bunch', price: 3.99, weight: 0.9 },
    { title: 'Honeycrisp Apples', description: 'Sweet and crispy apples - 3 lb bag', price: 5.99, weight: 1.4 },
    { title: 'Baby Spinach', description: 'Fresh baby spinach leaves - 5 oz container', price: 2.99, weight: 0.15 },
    { title: 'Avocados', description: 'Ripe Hass avocados - pack of 4', price: 4.99, weight: 0.8 },
    { title: 'Cherry Tomatoes', description: 'Sweet cherry tomatoes - 1 lb container', price: 3.49, weight: 0.45 }
  ],
  'Pantry Staples': [
    { title: 'Jasmine Rice', description: 'Premium jasmine rice - 5 lb bag', price: 8.99, weight: 2.3 },
    { title: 'Olive Oil Extra Virgin', description: 'Cold-pressed extra virgin olive oil - 500ml', price: 12.99, weight: 0.5 },
    { title: 'Whole Wheat Pasta', description: 'Organic whole wheat penne pasta - 1 lb', price: 2.99, weight: 0.45 },
    { title: 'Black Beans Canned', description: 'Organic black beans - 15 oz can', price: 1.99, weight: 0.45 },
    { title: 'Sea Salt', description: 'Fine sea salt for cooking - 26 oz container', price: 4.99, weight: 0.75 }
  ],
  'Snacks & Candy': [
    { title: 'KIND Protein Bars', description: 'Almond butter protein bars - 12 pack', price: 19.99, weight: 0.6 },
    { title: 'Lay\'s Potato Chips', description: 'Classic potato chips - family size bag', price: 4.99, weight: 0.3 },
    { title: 'Haribo Gummy Bears', description: 'Original gummy bears - 5 lb bag', price: 14.99, weight: 2.3 },
    { title: 'Trail Mix', description: 'Mixed nuts and dried fruit - 2 lb container', price: 12.99, weight: 0.9 },
    { title: 'Dark Chocolate Bar', description: '70% cacao dark chocolate - 3.5 oz bar', price: 3.99, weight: 0.1 }
  ],
  'Beverages': [
    { title: 'Coca-Cola Classic', description: 'Classic Coke - 12 pack cans', price: 6.99, weight: 4.3 },
    { title: 'Starbucks Cold Brew', description: 'Unsweetened cold brew coffee - 48 oz', price: 4.99, weight: 1.4 },
    { title: 'Tropicana Orange Juice', description: 'Pure premium orange juice - 59 oz', price: 4.49, weight: 1.7 },
    { title: 'LaCroix Sparkling Water', description: 'Lime flavored sparkling water - 12 pack', price: 5.99, weight: 4.1 },
    { title: 'Green Tea Bags', description: 'Organic green tea - 100 tea bags', price: 8.99, weight: 0.2 }
  ],
  'Frozen Foods': [
    { title: 'Ben & Jerry\'s Ice Cream', description: 'Chocolate chip cookie dough - pint', price: 5.99, weight: 0.5 },
    { title: 'Frozen Pizza', description: 'Margherita pizza - 12 inch', price: 7.99, weight: 0.8 },
    { title: 'Frozen Berries Mix', description: 'Mixed berries for smoothies - 2 lb bag', price: 8.99, weight: 0.9 },
    { title: 'Chicken Nuggets', description: 'Breaded chicken nuggets - 2 lb bag', price: 9.99, weight: 0.9 },
    { title: 'Frozen Vegetables', description: 'Mixed vegetables medley - 1 lb bag', price: 2.99, weight: 0.45 }
  ],
  'Organic & Health': [
    { title: 'Quinoa Organic', description: 'Organic tri-color quinoa - 2 lb bag', price: 12.99, weight: 0.9 },
    { title: 'Almond Milk', description: 'Unsweetened almond milk - 64 oz carton', price: 3.99, weight: 1.9 },
    { title: 'Chia Seeds', description: 'Organic chia seeds - 1 lb bag', price: 9.99, weight: 0.45 },
    { title: 'Coconut Oil', description: 'Virgin coconut oil - 16 oz jar', price: 8.99, weight: 0.45 },
    { title: 'Protein Powder', description: 'Plant-based vanilla protein - 2 lb container', price: 39.99, weight: 0.9 }
  ],

  // Office & School
  'Writing Supplies': [
    { title: 'BIC Ballpoint Pens', description: 'Blue ink ballpoint pens - 12 pack', price: 4.99, weight: 0.15 },
    { title: 'Sharpie Permanent Markers', description: 'Assorted colors permanent markers - 8 pack', price: 8.99, weight: 0.2 },
    { title: 'Pilot G2 Gel Pens', description: 'Retractable gel pens - black 6 pack', price: 12.99, weight: 0.18 },
    { title: 'Pencil Set #2', description: 'Yellow #2 pencils with erasers - 24 pack', price: 6.99, weight: 0.3 },
    { title: 'Highlighter Set', description: 'Fluorescent highlighters - 6 colors', price: 7.99, weight: 0.12 }
  ],
  'Paper Products': [
    { title: 'Copy Paper', description: 'White copy paper 8.5x11 - 500 sheets', price: 9.99, weight: 2.3 },
    { title: 'Spiral Notebooks', description: 'College-ruled spiral notebooks - 5 pack', price: 12.99, weight: 1.5 },
    { title: 'Sticky Notes', description: 'Yellow sticky notes 3x3 - 12 pads', price: 8.99, weight: 0.4 },
    { title: 'Index Cards', description: 'White index cards 3x5 - 500 count', price: 4.99, weight: 0.6 },
    { title: 'Legal Pads', description: 'Yellow legal pads 8.5x11 - 6 pack', price: 14.99, weight: 1.8 }
  ],
  'Office Electronics': [
    { title: 'HP LaserJet Printer', description: 'Wireless black and white laser printer', price: 199.99, weight: 7.0 },
    { title: 'Canon Scanner', description: 'Flatbed document scanner with USB', price: 89.99, weight: 2.5 },
    { title: 'Texas Instruments Calculator', description: 'Scientific calculator for students', price: 24.99, weight: 0.25 },
    { title: 'Logitech Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', price: 29.99, weight: 0.1 },
    { title: 'Paper Shredder', description: 'Cross-cut paper shredder for security', price: 79.99, weight: 5.5 }
  ],
  'Organization': [
    { title: 'File Folders', description: 'Manila file folders letter size - 100 pack', price: 19.99, weight: 2.0 },
    { title: 'Desk Organizer', description: 'Bamboo desk organizer with compartments', price: 34.99, weight: 1.2 },
    { title: 'Storage Boxes', description: 'Cardboard storage boxes - 12 pack', price: 24.99, weight: 3.0 },
    { title: 'Binder Clips', description: 'Assorted size binder clips - 60 pack', price: 8.99, weight: 0.5 },
    { title: 'Label Maker', description: 'Electronic label maker with tape', price: 49.99, weight: 0.8 }
  ],
  'Art Supplies': [
    { title: 'Crayola Colored Pencils', description: '50 colored pencils in tin case', price: 14.99, weight: 0.4 },
    { title: 'Acrylic Paint Set', description: '24 colors acrylic paint with brushes', price: 29.99, weight: 1.5 },
    { title: 'Sketchbook', description: 'Hardbound sketchbook 9x12 - 100 pages', price: 12.99, weight: 0.8 },
    { title: 'Watercolor Set', description: 'Professional watercolor paints - 36 colors', price: 39.99, weight: 0.6 },
    { title: 'Craft Scissors', description: 'Precision craft scissors with comfort grip', price: 9.99, weight: 0.15 }
  ],
  'School Supplies': [
    { title: 'Backpack', description: 'Durable school backpack with laptop compartment', price: 49.99, weight: 1.2 },
    { title: 'Lunch Box', description: 'Insulated lunch box with ice pack', price: 19.99, weight: 0.6 },
    { title: 'Pencil Case', description: 'Zippered pencil case with compartments', price: 8.99, weight: 0.2 },
    { title: 'Ruler Set', description: 'Plastic rulers 6, 12, and 18 inch', price: 5.99, weight: 0.15 },
    { title: 'Glue Sticks', description: 'Washable glue sticks - 12 pack', price: 11.99, weight: 0.4 }
  ]
};

function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomStock(): number {
  return Math.floor(Math.random() * 100) + 10; // Random stock between 10-109
}

function getRandomImageUrl(): string {
  const imageIds = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
  ];
  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
  return `https://picsum.photos/400/400?random=${randomId}`;
}

async function generateProducts() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);
  const categoriesService = app.get(CategoriesService);

  try {
    console.log('🏭 Starting product generation...\n');
    
    const categoryTree = await categoriesService.findCategoryTree();
    
    if (categoryTree.length === 0) {
      console.log('❌ No categories found in the database');
      await app.close();
      return;
    }

    let totalProductsCreated = 0;

    for (const category of categoryTree) {
      console.log(`\n📂 Processing category: ${category.name}`);
      
      if (category.children && category.children.length > 0) {
        for (const subcategory of category.children) {
          console.log(`  📁 Processing subcategory: ${subcategory.name}`);
          
          const templates = productTemplates[subcategory.name];
          if (!templates) {
            console.log(`    ⚠️  No product templates found for ${subcategory.name}`);
            continue;
          }

          // Create 5 products for this subcategory
          for (let i = 0; i < 5; i++) {
            const template = templates[i % templates.length]; // Cycle through templates if needed
            
            try {
              const product = await productsService.create({
                title: template.title,
                description: template.description,
                price: template.price,
                weight: template.weight,
                categoryId: category.id,
                subcategoryId: subcategory.id,
                stock: getRandomStock(),
                sku: generateSKU(),
                image: getRandomImageUrl(),
                isActive: true
              });

              console.log(`    ✅ Created: ${product.title} (ID: ${product.id})`);
              totalProductsCreated++;
            } catch (error) {
              console.log(`    ❌ Failed to create product: ${template.title} - ${error.message}`);
            }
          }
        }
      }
    }

    console.log(`\n🎉 Product generation completed!`);
    console.log(`📊 Total products created: ${totalProductsCreated}`);
    console.log(`📈 Products per subcategory: 5`);
    console.log(`🏷️  Total subcategories processed: ${totalProductsCreated / 5}`);
    
  } catch (error) {
    console.error('❌ Error generating products:', error.message);
  } finally {
    await app.close();
  }
}

generateProducts();