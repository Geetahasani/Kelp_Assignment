const fs = require('fs');
const readline = require('readline');

/**
 * Splits a CSV line handling quoted fields and embedded commas.
 * Also handles escaped quotes ("").
 */
const splitCSVLine = (line) => {
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Handle escaped quotes ("")
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  
  // Trim and remove outer quotes from each field
  return fields.map(field => {
    let trimmed = field.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      trimmed = trimmed.slice(1, -1);
    }
    return trimmed;
  });
};

/**
 * Helper function to create nested objects from dot-notation keys.
 */
const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  let temp = obj;
  
  keys.forEach((key, keyIndex) => {
    if (keyIndex === keys.length - 1) {
      // At the last key, set the value
      // Convert age to number if the key is 'age'
      if (key === 'age') {
        temp[key] = parseInt(value, 10) || 0;
      } else {
        temp[key] = value;
      }
    } else {
      // Create nested object if it doesn't exist
      if (!temp[key] || typeof temp[key] !== 'object' || Array.isArray(temp[key])) {
        temp[key] = {};
      }
      temp = temp[key];
    }
  });
};

/**
 * Parses the CSV file specified in the environment variable.
 * Uses streams to handle large files (50000+ records).
 * Returns a Promise that resolves with an array of records.
 */
const parseCSV = () => {
  return new Promise((resolve, reject) => {
    const records = [];
    let headers = [];
    let lineNumber = 0;

    // Get file path from environment variable 
    const filePath = process.env.CSV_FILE_PATH;

    if (!filePath) {
      return reject(new Error('CSV_FILE_PATH environment variable is not set.'));
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`CSV file not found at: ${filePath}`));
    }

    const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      lineNumber++;
      
      // Skip empty lines
      if (!line.trim()) {
        return;
      }

      // First line is headers 
      if (headers.length === 0) {
        headers = splitCSVLine(line);
        console.log(`Parsed ${headers.length} headers from CSV`);
      } else {
        try {
          const values = splitCSVLine(line);
          
          // Pad short rows with empty strings
          while (values.length < headers.length) {
            values.push('');
          }
          
          let record = {};

          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              setNestedValue(record, header, values[index]);
            }
          });
          
          // Validate mandatory fields
          if (!record.name?.firstName || !record.name?.lastName || record.age === undefined) {
            console.warn(`Line ${lineNumber}: Missing mandatory fields (name.firstName, name.lastName, or age)`);
          }
          
          records.push(record);
        } catch (err) {
          console.error(`Error parsing line ${lineNumber}:`, err.message);
          // Continue parsing remaining lines
        }
      }
    });

    rl.on('close', () => {
      console.log(`Successfully parsed ${records.length} records from CSV`);
      resolve(records);
    });

    rl.on('error', (err) => {
      reject(new Error(`Error reading CSV file: ${err.message}`));
    });
  });
};

module.exports = { parseCSV };