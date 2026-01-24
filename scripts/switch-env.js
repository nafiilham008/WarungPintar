const fs = require('fs');
const path = require('path');

const env = process.argv[2]; // 'dev' or 'prod'

if (!env || (env !== 'dev' && env !== 'prod')) {
    console.error('Usage: node scripts/switch-env.js [dev|prod]');
    process.exit(1);
}

const sourceFile = path.join(__dirname, '..', `.env.${env}`);
const targetFile = path.join(__dirname, '..', '.env.local');

try {
    if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, targetFile);
        console.log(`\n✅ BERHASIL SWITCH KE ENVIRONMENT: ${env.toUpperCase()}`);
        console.log(`   Source: .env.${env}`);
        console.log(`   Target: .env.local (Overwrites .env defaults)`);
        console.log(`\n   Silahkan restart server: npm run dev\n`);
    } else {
        console.error(`❌ Source file not found: .env.${env}`);
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error switching environment:', error);
    process.exit(1);
}
