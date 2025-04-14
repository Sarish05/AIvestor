const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// List of sectors provided by the user
const sectors = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Goods',
  'Energy',
  'RealEstate',
  'Utilities',
  'Industrials',
  'Materials',
  'Telecommunications'
];

// Function to randomly assign sectors while ensuring some patterns
// For example, banks should be in Financial Services
function assignSector(companyName, symbol) {
  const name = companyName.toLowerCase();
  const sym = symbol.toLowerCase();
  
  // Financial institutions
  if (name.includes('bank') || name.includes('finance') || name.includes('finserv') || 
      name.includes('financial') || name.includes('insurance') || sym.includes('bank') || 
      name.includes('housing finance') || name.includes('credit') || 
      name.includes('capital') || name.includes('wealth')) {
    return 'Financial Services';
  }
  
  // Technology companies
  if (name.includes('tech') || name.includes('digital') || name.includes('software') || 
      name.includes('info') || name.includes('computer') || name.includes('data') || 
      name.includes('system') || name.includes('solution') || name.includes('it ') || 
      name.includes('infotech') || name.includes('electronics')) {
    return 'Technology';
  }
  
  // Healthcare companies
  if (name.includes('pharma') || name.includes('health') || name.includes('hospital') || 
      name.includes('medical') || name.includes('healthcare') || name.includes('drug') || 
      name.includes('laboratory') || name.includes('biotech') || name.includes('diagnostics')) {
    return 'Healthcare';
  }
  
  // Energy companies
  if (name.includes('energy') || name.includes('power') || name.includes('oil') || 
      name.includes('petro') || name.includes('gas') || name.includes('fuel') || 
      name.includes('solar') || name.includes('wind') || name.includes('green energy')) {
    return 'Energy';
  }
  
  // Real Estate companies
  if (name.includes('real') || name.includes('property') || name.includes('estate') || 
      name.includes('construction') || name.includes('build') || name.includes('infra') || 
      name.includes('housing') || name.includes('cement')) {
    return 'RealEstate';
  }
  
  // Consumer Goods companies
  if (name.includes('consumer') || name.includes('retail') || name.includes('food') || 
      name.includes('beverage') || name.includes('textile') || name.includes('apparel') || 
      name.includes('fashion') || name.includes('hotel')) {
    return 'Consumer Goods';
  }
  
  // Otherwise, assign a random sector
  return sectors[Math.floor(Math.random() * sectors.length)];
}

// Read the CSV file
const csvPath = path.join(__dirname, 'stocks.csv');
fs.readFile(csvPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the CSV file:', err);
    return;
  }
  
  // Parse the CSV
  const result = Papa.parse(data, { header: true });
  
  // Update each stock with a sector
  const updatedData = result.data.map(stock => {
    if (stock.SYMBOL && stock['NAME OF COMPANY']) {
      return {
        ...stock,
        SECTOR: assignSector(stock['NAME OF COMPANY'], stock.SYMBOL)
      };
    }
    return stock;
  });
  
  // Convert back to CSV
  const csv = Papa.unparse(updatedData);
  
  // Write the updated CSV back to the file
  fs.writeFile(csvPath, csv, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing to the CSV file:', writeErr);
      return;
    }
    console.log('Successfully updated sectors in stocks.csv');
  });
}); 