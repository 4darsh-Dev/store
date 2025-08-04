# Bulk Import Examples

This directory contains example scripts for bulk importing data into your e-commerce store.

## Sample Data Files

### 1. Bulk Products Import

```json
{
  "products": [
    {
      "name": "iPhone 15 Pro Max",
      "desc": "The most advanced iPhone ever with titanium design and A17 Pro chip",
      "specialFeatures": ["A17 Pro Chip", "Titanium Design", "Pro Camera System", "5G Ready"],
      "images": [
        "/products/iphone-15-pro-max-1.jpg",
        "/products/iphone-15-pro-max-2.jpg",
        "/products/iphone-15-pro-max-3.jpg"
      ],
      "price": 1199.99,
      "salePrice": 1099.99,
      "sku": "IP15PM-NAT-1TB",
      "stock": 25,
      "brandName": "Apple",
      "categoryName": "Smartphones",
      "specs": {
        "display": "6.7-inch Super Retina XDR OLED",
        "processor": "A17 Pro chip",
        "storage": "1TB",
        "camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
        "battery": "Up to 29 hours video playback",
        "os": "iOS 17",
        "colors": ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]
      },
      "isAvailable": true
    },
    {
      "name": "Samsung Galaxy S24 Ultra",
      "desc": "AI-powered smartphone with S Pen and 200MP camera",
      "specialFeatures": ["Galaxy AI", "S Pen", "200MP Camera", "120Hz Display"],
      "images": ["/products/galaxy-s24-ultra-1.jpg", "/products/galaxy-s24-ultra-2.jpg"],
      "price": 1299.99,
      "salePrice": 1199.99,
      "sku": "GS24U-TIT-512",
      "stock": 30,
      "brandName": "Samsung",
      "categoryName": "Smartphones",
      "specs": {
        "display": "6.8-inch Dynamic AMOLED 2X",
        "processor": "Snapdragon 8 Gen 3",
        "storage": "512GB",
        "camera": "200MP Main, 50MP Periscope Telephoto, 12MP Ultra Wide",
        "battery": "5000mAh",
        "os": "Android 14 with One UI 6.1"
      },
      "isAvailable": true
    },
    {
      "name": "MacBook Pro 16-inch M3 Max",
      "desc": "Supercharged for pros with M3 Max chip and Liquid Retina XDR display",
      "specialFeatures": ["M3 Max Chip", "Liquid Retina XDR", "22-hour battery", "Studio-quality mics"],
      "images": ["/products/macbook-pro-16-m3-1.jpg", "/products/macbook-pro-16-m3-2.jpg"],
      "price": 3999.99,
      "sku": "MBP16-M3MAX-1TB",
      "stock": 15,
      "brandName": "Apple",
      "categoryName": "Laptops",
      "specs": {
        "display": "16.2-inch Liquid Retina XDR",
        "processor": "Apple M3 Max chip",
        "memory": "36GB unified memory",
        "storage": "1TB SSD",
        "graphics": "40-core GPU",
        "battery": "Up to 22 hours",
        "os": "macOS Sonoma"
      },
      "isAvailable": true
    },
    {
      "name": "Sony WH-1000XM5 Wireless Headphones",
      "desc": "Industry-leading noise canceling with exceptional sound quality",
      "specialFeatures": [
        "Industry-leading noise canceling",
        "30-hour battery",
        "Multipoint connection",
        "Quick Charge"
      ],
      "images": ["/products/sony-wh1000xm5-1.jpg", "/products/sony-wh1000xm5-2.jpg"],
      "price": 399.99,
      "salePrice": 349.99,
      "sku": "SXMH5-BLK",
      "stock": 50,
      "brandName": "Sony",
      "categoryName": "Audio",
      "specs": {
        "type": "Over-ear wireless",
        "driver": "30mm",
        "frequency": "4Hz-40,000Hz",
        "battery": "Up to 30 hours",
        "charging": "USB-C, Quick charge 3 min = 3 hours",
        "connectivity": "Bluetooth 5.2, multipoint"
      },
      "isAvailable": true
    },
    {
      "name": "Nike Air Jordan 1 Retro High OG",
      "desc": "Iconic basketball shoe with premium leather and classic colorway",
      "specialFeatures": ["Premium leather", "Air-Sole unit", "Rubber outsole", "Classic design"],
      "images": ["/products/air-jordan-1-1.jpg", "/products/air-jordan-1-2.jpg"],
      "price": 170.0,
      "sku": "AJ1-CHI-10",
      "stock": 40,
      "brandName": "Nike",
      "categoryName": "Shoes",
      "specs": {
        "type": "High-top basketball shoe",
        "material": "Premium leather upper",
        "sole": "Rubber outsole with pivot point",
        "cushioning": "Air-Sole unit in heel",
        "sizes": ["7", "8", "9", "10", "11", "12", "13"]
      },
      "isAvailable": true
    }
  ]
}
```

### 2. Bulk Categories Import

```json
{
  "categories": [
    {
      "name": "Electronics",
      "url": "electronics",
      "iconUrl": "/computerIcon.svg",
      "iconSize": [24, 24]
    },
    {
      "name": "Smartphones",
      "url": "smartphones",
      "iconUrl": "/phoneIcon.svg",
      "iconSize": [24, 24]
    },
    {
      "name": "Laptops",
      "url": "laptops",
      "iconUrl": "/computerIcon.svg",
      "iconSize": [24, 24]
    },
    {
      "name": "Audio",
      "url": "audio",
      "iconUrl": "/musicIcon.svg",
      "iconSize": [24, 24]
    },
    {
      "name": "Fashion",
      "url": "fashion",
      "iconUrl": "/otherCatIcon.svg",
      "iconSize": [24, 24]
    },
    {
      "name": "Shoes",
      "url": "shoes",
      "iconUrl": "/otherCatIcon.svg",
      "iconSize": [24, 24]
    },
    {
      "name": "Gaming",
      "url": "gaming",
      "iconUrl": "/icons/gaming.svg",
      "iconSize": [24, 24]
    }
  ]
}
```

### 3. Bulk Brands Import

```json
{
  "brands": [
    {
      "name": "Apple",
      "logoUrl": "/brands/apple.png"
    },
    {
      "name": "Samsung",
      "logoUrl": "/brands/samsung.png"
    },
    {
      "name": "Sony",
      "logoUrl": "/brands/sony.png"
    },
    {
      "name": "Nike",
      "logoUrl": "/brands/nike.png"
    },
    {
      "name": "Dell",
      "logoUrl": "/brands/dell.png"
    },
    {
      "name": "HP",
      "logoUrl": "/brands/hp.png"
    },
    {
      "name": "Lenovo",
      "logoUrl": "/brands/lenovo.png"
    },
    {
      "name": "Google",
      "logoUrl": "/brands/google.png"
    },
    {
      "name": "Microsoft",
      "logoUrl": "/brands/microsoft.png"
    },
    {
      "name": "Canon",
      "logoUrl": "/brands/canon.png"
    }
  ]
}
```

## Import Scripts

### Node.js Import Script

```javascript
// bulk-import.js
const fs = require("fs");

const API_BASE_URL = "http://localhost:3000/api";

async function importData(endpoint, dataFile) {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(`Import results for ${endpoint}:`, result);

    return result;
  } catch (error) {
    console.error(`Error importing ${endpoint}:`, error);
  }
}

async function runBulkImport() {
  console.log("Starting bulk import...");

  // Import in order: brands -> categories -> products
  await importData("/brands", "./sample-brands.json");
  await importData("/categories", "./sample-categories.json");
  await importData("/products/bulk", "./sample-products.json");

  console.log("Bulk import completed!");
}

runBulkImport();
```

### Python Import Script

```python
# bulk_import.py
import json
import requests

API_BASE_URL = 'http://localhost:3000/api'

def import_data(endpoint, data_file):
    try:
        with open(data_file, 'r') as f:
            data = json.load(f)

        response = requests.post(f'{API_BASE_URL}{endpoint}', json=data)
        result = response.json()

        print(f'Import results for {endpoint}: {result}')
        return result

    except Exception as e:
        print(f'Error importing {endpoint}: {e}')

def run_bulk_import():
    print('Starting bulk import...')

    # Import in order: brands -> categories -> products
    import_data('/brands', './sample-brands.json')
    import_data('/categories', './sample-categories.json')
    import_data('/products/bulk', './sample-products.json')

    print('Bulk import completed!')

if __name__ == '__main__':
    run_bulk_import()
```

## Usage Instructions

1. **Save sample data** to JSON files (e.g., `sample-products.json`)
2. **Start your Next.js server**: `npm run dev`
3. **Run the import script**:

   ```bash
   node bulk-import.js
   # or
   python bulk_import.py
   ```

4. **Verify imports** by checking:
   - Database using Prisma Studio: `npm run db:studio`
   - API endpoints: `GET /api/search`

## Data Validation

The API validates all input data:

- **Required fields**: name, price, brandName, categoryName
- **Data types**: numbers for price/stock, arrays for features/images
- **Constraints**: positive prices, valid URLs
- **Duplicates**: SKU uniqueness, brand/category existence

## Error Handling

Import results include:

- `success`: Number of successful imports
- `failed`: Number of failed imports
- `errors`: Array of error messages

Example response:

```json
{
  "message": "Bulk import completed",
  "results": {
    "success": 4,
    "failed": 1,
    "errors": ["Failed to create product 'Invalid Product': Price must be positive"]
  }
}
```
