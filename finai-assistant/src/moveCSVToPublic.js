const fs = require('fs');
const path = require('path');

// Define paths
const srcPath = path.join(__dirname, 'stocks.csv');
const publicPath = path.join(__dirname, '..', 'public', 'stocks.csv');

// Function to copy the file
function copyFile() {
  try {
    // Check if the source file exists
    if (!fs.existsSync(srcPath)) {
      console.error('Source file does not exist:', srcPath);
      return;
    }
    
    // Ensure the public directory exists
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Read the source file
    const data = fs.readFileSync(srcPath, 'utf8');
    
    // Write to the destination
    fs.writeFileSync(publicPath, data, 'utf8');
    
    console.log('Successfully copied stocks.csv to public directory');
  } catch (error) {
    console.error('Error copying file:', error);
  }
}

// Execute the copy
copyFile(); 