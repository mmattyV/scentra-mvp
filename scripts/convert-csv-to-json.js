const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Paths
const csvFilePath = path.join(__dirname, '../app/utils/fragrances-list.csv');
const outputFilePath = path.join(__dirname, '../app/utils/fragrance-data.json');

// Read and parse CSV file
try {
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  
  // Parse CSV content with specific headers from the file
  const records = parse(csvContent, {
    columns: true, // Auto-detect columns from header row
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Handle rows with inconsistent column counts
  });
  
  console.log(`Total records read: ${records.length}`);
  
  // Transform data with validation for each field
  const transformedData = [];
  let skippedRecords = 0;
  let index = 0;
  
  records.forEach(record => {
    // Generate a unique ID for each fragrance
    index++;
    
    // Extract fields using the actual column names from the CSV
    const name = record['Fragrance Name'];
    const brand = record['Fragrance Brand'];
    const year = record['Fragrance Year'];
    const description = record['Fragrance Description'];
    const gender = record['Gender'];
    const imageUrl = record['Image URL'];
    
    // Skip record if required fields are missing
    if (!name || !brand) {
      skippedRecords++;
      return; // Skip this record
    }
    
    // Create formatted name with year if available
    const formattedName = year ? `${name} (${year})` : name;
    
    // Generate a product ID if none exists
    const productId = `frag-${index.toString().padStart(6, '0')}`;
    
    // Add valid record to the array
    transformedData.push({
      productId,
      name: formattedName,
      brand,
      description: description || '',
      gender: gender || 'Unisex',
      imageUrl: imageUrl || ''
    });
  });
  
  console.log(`Processed ${transformedData.length} valid fragrance records`);
  console.log(`Skipped ${skippedRecords} invalid records`);
  
  // Write JSON to file
  fs.writeFileSync(outputFilePath, JSON.stringify(transformedData, null, 2));
  console.log(`Successfully wrote ${transformedData.length} records to ${outputFilePath}`);
} catch (error) {
  console.error('Error processing CSV:', error);
  process.exit(1);
}
