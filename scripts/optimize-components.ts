/**
 * Batch Optimization Script
 * Adds React.memo to multiple shared components
 */

import * as fs from 'fs';
import * as path from 'path';

const componentsToOptimize = [
  'Input.tsx',
  'Select.tsx',
  'Textarea.tsx',
  'Checkbox.tsx',
  'Card.tsx',
  'Badge.tsx',
  'Alert.tsx',
  'Modal.tsx',
  'Table.tsx',
  'Pagination.tsx',
];

const componentsDir = path.join(__dirname, '..', 'src', 'components', 'shared');

function addReactMemo(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already memoized
  if (content.includes('React.memo')) {
    console.log(`✓ ${path.basename(filePath)} already optimized`);
    return;
  }
  
  // Pattern 1: export const Component: React.FC<Props> = ({ ... }) => {
  const pattern1 = /export const (\w+): React\.FC<(\w+)> = \(/g;
  let optimized = content.replace(pattern1, 'export const $1 = React.memo<$2>((');
  
  // Pattern 2: Find the closing }; and add displayName
  const componentNameMatch = content.match(/export const (\w+)/);
  if (componentNameMatch) {
    const componentName = componentNameMatch[1];
    
    // Find last closing }; and add displayName before it
    const lastClosingIndex = optimized.lastIndexOf('};');
    if (lastClosingIndex !== -1) {
      optimized = 
        optimized.substring(0, lastClosingIndex) +
        `});\n\n${componentName}.displayName = '${componentName}';` +
        optimized.substring(lastClosingIndex + 2);
    }
  }
  
  // Update comment to mention optimization
  optimized = optimized.replace(
    /\/\*\*\n \* (.*?)\n \*\//,
    '/**\n * $1\n * Optimized with React.memo\n */'
  );
  
  fs.writeFileSync(filePath, optimized, 'utf-8');
  console.log(`✓ Optimized ${path.basename(filePath)}`);
}

function main() {
  console.log('Starting batch optimization...\n');
  
  componentsToOptimize.forEach((fileName) => {
    const filePath = path.join(componentsDir, fileName);
    
    if (fs.existsSync(filePath)) {
      try {
        addReactMemo(filePath);
      } catch (error) {
        console.error(`✗ Error optimizing ${fileName}:`, error);
      }
    } else {
      console.warn(`⚠ File not found: ${fileName}`);
    }
  });
  
  console.log('\nBatch optimization complete!');
}

main();
