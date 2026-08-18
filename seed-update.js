const fs = require('fs');

const wareImages = fs.readdirSync('public/AppImages/Warhouse/Warhouse')
  .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
  .map(f => `/AppImages/Warhouse/Warhouse/${f}`);

const fertilizerNames = [
  "Coco-Boost Organic Blend",
  "Nitrogen Max Yield",
  "Phosphorus Root Builder",
  "Green Leaf Liquid Feed",
  "Potassium Plus Granules",
  "Eco-Friendly Soil Conditioner",
  "Coconut Palm Special",
  "Premium NPK 20-20-20",
  "Organic Seaweed Extract",
  "Calcium Nitrate Supplement"
];

const fertilizerDetails = [
  "Specifically formulated to accelerate early growth in coconut palms and enhance yield.",
  "Rich in essential nutrients for robust root development and strong trunk formation.",
  "A 100% organic blend designed to retain moisture and improve soil aeration.",
  "Quick-release formula for fast recovery from nutrient deficiency in tropical climates.",
  "Provides a balanced mix of micro-nutrients essential for flowering and fruit setting.",
  "Slow-release pellets that feed your plants for up to 6 months without burning roots."
];

const seed = wareImages.map((path, i) => {
  const name = fertilizerNames[i % fertilizerNames.length] + (i >= fertilizerNames.length ? ` (Batch ${Math.floor(i/10)+1})` : '');
  const description = fertilizerDetails[i % fertilizerDetails.length];
  const price = (Math.random() * (85 - 15) + 15).toFixed(2);
  
  return {
    id: i + 1,
    name: name,
    description: description,
    image: path,
    price: parseFloat(price),
    dateAdded: new Date().toISOString()
  };
});

fs.writeFileSync('src/data/seed.json', JSON.stringify(seed, null, 2), 'utf8');
console.log("seed.json updated with detailed dummy data.");
