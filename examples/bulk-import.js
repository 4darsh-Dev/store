const fs = require('fs')

const API_BASE_URL = 'http://localhost:3000/api'

async function importData(endpoint, dataFile) {
  try {
    console.log(`📦 Importing data from ${dataFile} to ${endpoint}...`)
    
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log(`✅ Import results for ${endpoint}:`)
    console.log(`   Success: ${result.results?.success || 'N/A'}`)
    console.log(`   Failed: ${result.results?.failed || 'N/A'}`)
    
    if (result.results?.errors && result.results.errors.length > 0) {
      console.log(`   Errors:`)
      result.results.errors.forEach(error => console.log(`     - ${error}`))
    }
    
    console.log('')
    return result
  } catch (error) {
    console.error(`❌ Error importing ${endpoint}:`, error.message)
    console.log('')
    return null
  }
}

async function testAPIConnection() {
  try {
    console.log('🔍 Testing API connection...')
    const response = await fetch(`${API_BASE_URL}/search?q=test`)
    
    if (response.ok) {
      console.log('✅ API connection successful!')
    } else {
      console.log('⚠️  API connection failed. Make sure your server is running on port 3000')
    }
    console.log('')
  } catch (error) {
    console.log('⚠️  Could not connect to API. Make sure your server is running with `npm run dev`')
    console.log('')
  }
}

async function runBulkImport() {
  console.log('🚀 Starting bulk import process...')
  console.log('')
  
  // Test API connection first
  await testAPIConnection()
  
  // Import in order: brands -> categories -> products
  const results = {
    brands: await importData('/brands', './sample-brands.json'),
    categories: await importData('/categories', './sample-categories.json'),
    products: await importData('/products/bulk', './sample-products.json')
  }
  
  console.log('📊 Final Summary:')
  console.log('================')
  
  let totalSuccess = 0
  let totalFailed = 0
  
  Object.entries(results).forEach(([type, result]) => {
    if (result && result.results) {
      console.log(`${type.toUpperCase()}:`)
      console.log(`  ✅ Success: ${result.results.success}`)
      console.log(`  ❌ Failed: ${result.results.failed}`)
      totalSuccess += result.results.success
      totalFailed += result.results.failed
    }
  })
  
  console.log('')
  console.log(`TOTAL: ✅ ${totalSuccess} successful | ❌ ${totalFailed} failed`)
  console.log('')
  console.log('🎉 Bulk import completed!')
  console.log('')
  console.log('📋 Next steps:')
  console.log('  1. Open http://localhost:3000 to view your store')
  console.log('  2. Run `npm run db:studio` to view your database')
  console.log('  3. Test search: http://localhost:3000/api/search?q=iPhone')
}

// Check if this script is being run directly
if (require.main === module) {
  runBulkImport().catch(console.error)
}

module.exports = { importData, runBulkImport }