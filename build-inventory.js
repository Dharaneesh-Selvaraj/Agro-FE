const fs = require('fs');
const path = require('path');

const inventoryTree = {
  "WEEDICIDES / HERBICIDES": {
    "General": [
      "2,4-D Salt", "2,4-D Amine Salt 58% SL", "Alachlor 50 EC",
      "Ammonium Salt of Glyphosate 71% SG", "Atrazine 50%", "Butachlor 50% EW",
      "Chlorimuron Ethyl 25% WP", "Flumioxazin 50% SC", "Glyphosate 41% SL",
      "Glyphosate 54% W/W", "Glyphosate Potassium Salt 54%", "Mesotrione + Atrazine",
      "Mesotrione 40% SC", "Metribuzin 70% WP", "Oxadiargyl 80% WP",
      "Oxyfluorfen 23.5% EC", "Oxyfluorfen + Glyphosate", "Paraquat Dichloride 24% SL",
      "Pendimethalin 30% EC", "Quizalofop-Ethyl 5% EC", "Tembotrione + Atrazine",
      "Tolpyralate 40% SC"
    ]
  },
  "PESTICIDES": {
    "Acetamiprid": ["Acetamiprid 20% SP", "Diafenthiuron + Acetamiprid"],
    "Fipronil": [
      "Fipronil 18.81%", "Fipronil 2.5% + Propargite 35% SE",
      "Fipronil 40% + Imidacloprid 40%", "Fipronil 5% SC",
      "Fipronil 80% WG", "Fipronil 0.6% GR"
    ],
    "Imidacloprid": [
      "Imidacloprid 17.8% SL", "Imidacloprid 30.5% SC",
      "Imidacloprid 70% WG", "Imidacloprid + Lambda-Cyhalothrin"
    ],
    "Thiamethoxam": [
      "Thiamethoxam 25% WG", "Thiamethoxam 30% FS",
      "Thiamethoxam 75% SG", "Thiamethoxam + Lambda-Cyhalothrin",
      "Thiamethoxam + Thiophanate Methyl + Trifloxystrobin",
      "Thiamethoxam + other combinations"
    ],
    "Other insecticides": [
      "Acephate", "Bifenthrin", "Buprofezin", "Chlorantraniliprole",
      "Chlorfenapyr", "Chlorpyrifos", "Clothianidin", "Cypermethrin",
      "Deltamethrin", "Dimethoate", "Dinotefuran", "Emamectin Benzoate",
      "Fenobucarb", "Fenpyroximate", "Flubendiamide", "Lambda-Cyhalothrin",
      "Malathion", "Phenthoate", "Phorate", "Profenofos", "Pymetrozine",
      "Quinalphos", "Spinetoram", "Spiromesifen", "Thiodicarb"
    ]
  },
  "FUNGICIDES": {
    "General": [
      "Difenoconazole + Mancozeb", "Hexaconazole + Validamycin",
      "Tebuconazole + Sulphur", "Thifluzamide + Difenoconazole + Validamycin",
      "Thiophanate Methyl 70% WP", "Tribasic Copper Sulfate 34.5% SC",
      "Sulphur 40% SC"
    ]
  },
  "PLANT GROWTH REGULATORS / BIOSTIMULANTS": {
    "General": [
      "Nitrobenzene", "Ortho Silicic Acid 12%",
      "Sodium Para-Nitro Phenolate", "Triacontanol 0.1% EW"
    ]
  },
  "FERTILIZERS": {
    "Granular / Bulk Fertilizers": [
      "10:26:26 \u2013 50 Kg", "15:15:15 \u2013 50 Kg", "16:16:16 \u2013 50 Kg",
      "16N:20 \u2013 50 Kg", "17:17:17 \u2013 50 Kg", "20:20:0:13 \u2013 50 Kg",
      "28:28:0 \u2013 50 Kg", "Ammonium Chloride \u2013 50 Kg", "Ammonium Sulphate \u2013 50 Kg",
      "DAP \u2013 50 Kg", "MOP \u2013 IPL Red \u2013 50 Kg", "MOP \u2013 IPL White \u2013 50 Kg",
      "Super Phosphate \u2013 50 Kg", "Super Phosphate \u2013 TSP \u2013 50 Kg", "Urea \u2013 45 Kg"
    ],
    "General Fertilizers / Soil Amendments": [
      "Mix No. 18 \u2013 50 Kg", "Magnesium Sulphate \u2013 25 Kg", "Magnesium Sulphate \u2013 50 Kg",
      "Mixture No. 8:8:16 \u2013 50 Kg", "Poly Halite \u2013 IPL \u2013 25 Kg", "Poly Sulphate \u2013 IPL \u2013 50 Kg",
      "Micronol Coconut C-18 \u2013 50 Kg", "Micronol Coco 18 \u2013 50 Kg", "Micronol Bhagya \u2013 50 Kg",
      "Salba-G \u2013 50 Kg", "Salba-R \u2013 50 Kg", "Agromin \u2013 50 Kg",
      "Agromin Soil Plus \u2013 50 Kg", "Mithra-G \u2013 50 Kg", "Agriya Plus \u2013 50 Kg",
      "Criyagen \u2013 25 Kg", "Neem Cake \u2013 50 Kg", "Rock Phosphate \u2013 50 Kg"
    ]
  },
  "WATER-SOLUBLE FERTILIZERS": {
    "NPK / Macronutrients": [
      "00:52:34 \u2013 25 Kg", "12:61:00 \u2013 25 Kg", "13:00:45 \u2013 25 Kg",
      "19:19:19 \u2013 25 Kg", "20:20:20 \u2013 25 Kg", "15:15:30 \u2013 25 Kg",
      "12:00:60 \u2013 25 Kg", "12:52:08 \u2013 25 Kg", "17:00:17 \u2013 25 Kg",
      "12:00:23 \u2013 25 Kg", "15:30:15 \u2013 25 Kg", "Yaramila Complex \u2013 25 Kg"
    ],
    "Specialized Water-Soluble Fertilizers": [
      "Calcium Nitrate \u2013 25 Kg", "Calcium Nitrate with Boron \u2013 25 Kg",
      "Grower (12:11:18) \u2013 25 Kg", "Growgroup Hi-Feed \u2013 20 Kg",
      "Grow Group Hi Veg \u2013 5 Kg", "Growgroup Nitroz \u2013 25 Kg",
      "Kokos NPK \u2013 25 Kg", "Potassium Schoenite \u2013 25 Kg",
      "Potassium Nitrate \u2013 25 Kg", "SOP 00:00:50 \u2013 25 Kg",
      "Ferrous Sulphate \u2013 25 Kg", "Zinc Sulphate \u2013 25 Kg",
      "Manganese Sulphate \u2013 25 Kg", "Borax \u2013 25 Kg", "Micronol Coconut CF-18 \u2013 25 Kg"
    ]
  },
  "BIOLOGICAL PRODUCTS": {
    "Bio-Fungicide": ["Bio-Fungicide"],
    "Bio-Micronutrient": ["Bio-Micr", "General-Micr-Foliar", "General-Micr-Soil Application", "General-Micr-Trip", "Water Soluble \u2013 Micr"],
    "Bio-Pesticide": ["Bio-Pest", "General-Pest"],
    "Bio-Stimulants": ["Bio-Stimulant Foliar", "Bio-Stimulant Trip", "Water Soluble \u2013 Foliar Spray"]
  }
};

let seedData = [];
let idCounter = 1;

for (const [category, subCategories] of Object.entries(inventoryTree)) {
  for (const [subCategory, products] of Object.entries(subCategories)) {
    for (const productName of products) {
      let imagePath = '/AppImages/Products/fert-bag.png';
      
      if (['PESTICIDES', 'WEEDICIDES / HERBICIDES', 'FUNGICIDES', 'PLANT GROWTH REGULATORS / BIOSTIMULANTS'].includes(category)) {
        imagePath = '/AppImages/Products/bottle.png';
      }
      
      seedData.push({
        id: `prod_${idCounter++}`,
        name: productName,
        price: Math.floor(Math.random() * (2500 - 300 + 1) + 300),
        description: `Premium quality ${category.toLowerCase()} (${subCategory.toLowerCase()}) sourced from top manufacturers.`,
        category: category,
        subCategory: subCategory,
        image: imagePath,
        rating: Number((Math.random() * (5 - 4) + 4).toFixed(1)),
        reviews: Math.floor(Math.random() * 150) + 5,
        tags: [category, subCategory]
      });
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'seed.json'), JSON.stringify(seedData, null, 2));
console.log('Successfully generated complete hierarchical inventory seed data.');
