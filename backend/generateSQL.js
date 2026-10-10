const fs = require('fs');
const path = require('path');

// Manually load the IMGBB_API_KEY from the frontend's .env.local
let apiKey = '970ff5b1b7074e586c6c30edf1a0c9ce'; // Fallback to the one they provided
const frontendEnvPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(frontendEnvPath)) {
  const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
  const match = envContent.match(/IMGBB_API_KEY=(.*)/);
  if (match) {
    apiKey = match[1].trim();
  }
}

async function uploadToImgBB(localImagePath) {
  const absolutePath = path.join(__dirname, '..', 'public', localImagePath.replace(/^\//, ''));
  
  if (!fs.existsSync(absolutePath)) {
    if (localImagePath.includes('bottle')) return 'https://placehold.co/400x600/e2e8f0/1e293b.png?text=Bottle';
    if (localImagePath.includes('bag')) return 'https://placehold.co/400x600/e2e8f0/1e293b.png?text=Fertilizer+Bag';
    return 'https://placehold.co/400x600/e2e8f0/1e293b.png?text=Product';
  }

  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');
  const formData = new URLSearchParams();
  formData.append('image', base64Image);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = await response.json();
    if (data.success) {
      return data.data.display_url;
    }
  } catch (err) {}
  return localImagePath;
}

async function generateSQL() {
  const seedFilePath = path.join(__dirname, '..', 'src', 'data', 'seed.json');
  const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));
  
  const uniqueImages = [...new Set(seedData.map(p => p.image))].filter(Boolean);
  const imageUrlMap = {};

  console.log('Uploading images to ImgBB and generating SQL...');
  for (const imagePath of uniqueImages) {
    if (imagePath.startsWith('/')) {
      const cloudUrl = await uploadToImgBB(imagePath);
      imageUrlMap[imagePath] = cloudUrl;
    } else {
      imageUrlMap[imagePath] = imagePath;
    }
  }

  let sql = 'TRUNCATE TABLE products;\n';
  sql += 'INSERT INTO products (name, price, description, category, subCategory, image, rating, reviews, tags) VALUES\n';
  
  const values = seedData.map(product => {
    const cloudImage = imageUrlMap[product.image] || product.image;
    const name = product.name.replace(/'/g, "''");
    const desc = (product.description || '').replace(/'/g, "''");
    const tags = JSON.stringify(product.tags || []).replace(/'/g, "''");
    
    return `('${name}', ${product.price || 0}, '${desc}', '${product.category || 'General'}', '${product.subCategory || 'General'}', '${cloudImage}', ${product.rating || 0}, ${product.reviews || 0}, '${tags}')`;
  });

  sql += values.join(',\n') + ';\n';
  fs.writeFileSync(path.join(__dirname, 'seed.sql'), sql);
  console.log('SQL generated successfully at backend/seed.sql');
}

generateSQL();
