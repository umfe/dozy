import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const packageJsonPath = path.join(rootDir, 'package.json');
const indexTsPath = path.join(rootDir, 'src', 'index.ts');

try {
    // Read package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    const oldVersion = packageJson.version;
    
    // Increment version
    const versionParts = oldVersion.split('.');
    if (versionParts.length !== 3) {
        throw new Error(`Invalid version format: ${oldVersion}`);
    }
    versionParts[2] = parseInt(versionParts[2], 10) + 1;
    const newVersion = versionParts.join('.');
    
    console.log(`Bumping version from ${oldVersion} to ${newVersion}`);
    
    // Update package.json
    packageJson.version = newVersion;
    // Detect indentation (tab or spaces)
    const indent = packageJsonContent.includes('\t') ? '\t' : 2;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, indent) + '\n');
    
    // Update src/index.ts
    let indexTs = fs.readFileSync(indexTsPath, 'utf-8');
    // Regex to match: export const DOZY = '1.0.33'
    // Allowing for flexibility in spacing
    const regex = /(export\s+const\s+DOZY\s*=\s*['"])([\d\.]+)(['"])/;
    
    if (regex.test(indexTs)) {
        indexTs = indexTs.replace(regex, `$1${newVersion}$3`);
        fs.writeFileSync(indexTsPath, indexTs);
        console.log(`Updated src/index.ts`);
    } else {
        console.error('Could not find DOZY version export in src/index.ts');
        // We don't exit with error to avoid breaking the CI if only this fails, 
        // but user specifically asked for this. So we should probably fail or warn.
        // Let's fail to ensure correctness.
        process.exit(1);
    }
    
} catch (error) {
    console.error('Error bumping version:', error);
    process.exit(1);
}
