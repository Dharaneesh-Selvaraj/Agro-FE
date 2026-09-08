const fs = require('fs');
const path = require('path');

const storeDir = path.join(__dirname, 'public', 'AppImages', 'Store');
const seedFile = path.join(__dirname, 'src', 'data', 'seed.json');

try {
  const files = fs.readdirSync(storeDir);
  
  const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
  
  const products = imageFiles.map((file, index) => {
    return {
      id: index + 1,
      name: `Premium Store Product ${index + 1}`,
      description: "High-quality agricultural product meticulously selected for your farming needs.",
      image: `/AppImages/Store/${file}`,
      dateAdded: new Date().toISOString()
    };
  });
  
  fs.writeFileSync(seedFile, JSON.stringify(products, null, 2));
  console.log(`Successfully generated seed.json with ${products.length} products from the Store directory.`);
} catch (error) {
  console.error("Error updating seed.json:", error);
}
