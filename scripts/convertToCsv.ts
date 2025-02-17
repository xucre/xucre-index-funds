// filepath: /Users/jp/Desktop/Repos/xucre/xucre-index-funds/scripts/convertToCsv.ts

import * as fs from 'fs';
import * as path from 'path';

// Define paths for the input JSON file and output CSV file
const dataDir = path.join(__dirname, '../data');
const inputFilePath = path.join(dataDir, 'validatedPolygonPools.json');
const outputFilePath = path.join(dataDir, 'targetTokens.csv');

try {
  // Read the JSON file
  const rawData = fs.readFileSync(inputFilePath, 'utf8');
  const parsedData = JSON.parse(rawData);

  // Check if parsedData is an array
  if (!Array.isArray(parsedData)) {
    throw new Error('Expected JSON data to be an array');
  }

  // Extract targetToken values from each entry and filter out undefined values
  const targetTokens = parsedData.map((entry: any) => {return {...entry.targetToken, sourceToken: entry.sourceToken.name}}).filter((token: any) => token !== undefined);

  // If there are no targetTokens, exit
  if (targetTokens.length === 0) {
    throw new Error('No targetToken objects found in JSON data');
  }

  // Determine all unique columns from the targetToken objects
  const columns = Array.from(new Set(targetTokens.flatMap((token: any) => Object.keys(token))));

  // Helper function to escape CSV values
  const escapeCsv = (value: any): string => {
    if (value === null || value === undefined) return '';
    let str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // Prepare CSV header and rows
  const header = columns.join(',');
  const rows = targetTokens.map((token: any) => {
    return columns.map(col => escapeCsv(token[col])).join(',');
  });

  const csvContent = [header, ...rows].join('\n');

  // Write CSV content to the output file
  fs.writeFileSync(outputFilePath, csvContent, 'utf8');

  console.log(`CSV file created successfully at ${outputFilePath}`);
} catch (error) {
  console.error('Error processing CSV conversion:', error);
  process.exit(1);
}
