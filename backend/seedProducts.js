require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDB } = require('./config/db');

// Manually load the IMGBB_API_KEY from the frontend's .env.local
const frontendEnvPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(frontendEnvPath)) {
  const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
  const match = envContent.match(/IMGBB_API_KEY=(.*)/);
  if (match) {
    process.env.IMGBB_API_KEY = match[1].trim();
  }
}

async function uploadToImgBB(localImagePath) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY is not found in .env.local');
  }

  // Construct absolute path to the image in the public folder
  const absolutePath = path.join(__dirname, '..', 'public', localImagePath.replace(/^\//, ''));
  
  if (!fs.existsSync(absolutePath)) {
    console.warn(`Warning: Image not found at ${absolutePath}`);
    // Use a placeholder URL depending on the filename
    if (localImagePath.includes('bottle')) {
      return 'https://placehold.co/400x600/e2e8f0/1e293b.png?text=Bottle';
    } else if (localImagePath.includes('bag')) {
      return 'https://placehold.co/400x600/e2e8f0/1e293b.png?text=Fertilizer+Bag';
    }
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();
    if (data.success) {
      return data.data.display_url;
    } else {
      console.error('ImgBB Upload Error:', data);
      throw new Error('Failed to upload image');
    }
  } catch (err) {
    console.error(`Failed to upload ${localImagePath}:`, err);
    return localImagePath;
  }
}

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    const pool = await initDB();

    console.log('Reading seed data...');
    const seedFilePath = path.join(__dirname, '..', 'src', 'data', 'seed.json');
    const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));

    console.log(`Found ${seedData.length} products to seed.`);

    // Check if products already exist to avoid duplicates
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (existing[0].count > 0) {
      console.log(`Database already has ${existing[0].count} products. Clearing table...`);
      await pool.query('TRUNCATE TABLE products');
    }

    console.log('Uploading images to ImgBB...');
    // Find unique images
    const uniqueImages = [...new Set(seedData.map(p => p.image))].filter(Boolean);
    const imageUrlMap = {};

    for (const imagePath of uniqueImages) {
      // Only upload if it's a local path
      if (imagePath.startsWith('/')) {
        console.log(`Uploading ${imagePath}...`);
        const cloudUrl = await uploadToImgBB(imagePath);
        imageUrlMap[imagePath] = cloudUrl;
        console.log(`Uploaded! Cloud URL: ${cloudUrl}`);
      } else {
        imageUrlMap[imagePath] = imagePath; // already a URL
      }
    }

    console.log('Inserting products into database with cloud images...');
    let count = 0;
    
    for (const product of seedData) {
      const cloudImage = imageUrlMap[product.image] || product.image;

      const query = `
        INSERT INTO products 
        (name, price, description, category, subCategory, image, rating, reviews, tags) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        product.name,
        product.price || 0,
        product.description || '',
        product.category || 'General',
        product.subCategory || 'General',
        cloudImage || '', // Use the cloud image URL
        product.rating || 0,
        product.reviews || 0,
        JSON.stringify(product.tags || [])
      ];
      
      await pool.query(query, values);
      count++;
    }

    console.log(`Successfully seeded ${count} products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
