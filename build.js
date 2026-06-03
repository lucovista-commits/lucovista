// build.js — Generate static HTML for top 200 programmatic pages
// Run: node build.js (before deploying to Netlify)

const fs = require('fs');
const path = require('path');

// Read your index.html template
const template = fs.readFileSync('index.html', 'utf8');

// Define your top pages
const pages = [];

// Top 50 banks
const banks = ['sbi', 'hdfc', 'icici', 'axis', 'pnb', 'kotak', 'bajaj', 'lic', 
               'yesbank', 'idfcfirst', 'union', 'canara', 'bob', 'federal', 
               'indusind', 'bandhan', 'rbl', 'tata', 'mahindra', 'shriram'];

// Top 20 loan amounts
const amounts = [500000, 1000000, 1500000, 2000000, 2500000, 3000000, 
                 4000000, 5000000, 6000000, 7500000, 10000000, 
                 15000000, 20000000, 30000000, 50000000];

// Top 15 cities
const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'hyderabad', 
                'pune', 'kolkata', 'ahmedabad', 'jaipur', 'lucknow', 
                'indore', 'chandigarh', 'surat', 'nagpur', 'kochi'];

// Generate bank pages
banks.forEach(bank => {
    pages.push({ url: `/emi-calculator/bank/${bank}`, params: `bank=${bank}` });
});

// Generate amount pages
amounts.forEach(amount => {
    pages.push({ url: `/emi-calculator/amount/${amount}`, params: `amount=${amount}` });
});

// Generate city pages
cities.forEach(city => {
    pages.push({ url: `/emi-calculator/city/${city}`, params: `city=${city}` });
});

// Generate high-value combo pages
banks.slice(0, 10).forEach(bank => {
    cities.slice(0, 5).forEach(city => {
        pages.push({ url: `/emi-calculator/${bank}-${city}`, params: `bank=${bank}&city=${city}` });
    });
});

// Generate SIP calculator pages
pages.push({ url: '/sip-calculator', params: 'calculator=sip' });
amounts.slice(0, 10).forEach(amount => {
    pages.push({ url: `/sip-calculator/${amount}`, params: `calculator=sip&amount=${amount}` });
});

// Generate car loan pages
const cars = ['maruti-swift', 'hyundai-creta', 'tata-nexon', 'mahindra-thar', 
              'kia-seltos', 'toyota-fortuner', 'honda-city'];
cars.forEach(car => {
    pages.push({ url: `/car-loan/${car}`, params: `calculator=car&car=${car}` });
});

// Create output directory
const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Generate each page
console.log(`Generating ${pages.length} static pages...`);

pages.forEach((page, index) => {
    // Create directory structure
    const dirPath = path.join(outDir, page.url);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    
    // Modify template to inject params
    let pageHtml = template;
    
    // Update the JavaScript to use the params
    const scriptInjection = `
    <script>
        // Override URL params for static page
        window.STATIC_PARAMS = '${page.params}';
        // Push state for this static page
        window.history.replaceState({}, '', '/emi-calculator?${page.params}');
    </script>`;
    
    pageHtml = pageHtml.replace('</head>', scriptInjection + '</head>');
    
    // Write the file
    fs.writeFileSync(path.join(dirPath, 'index.html'), pageHtml);
    
    if ((index + 1) % 50 === 0) {
        console.log(`Generated ${index + 1}/${pages.length} pages...`);
    }
});

// Generate sitemap.xml
let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

pages.forEach(page => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>https://lucovista.in${page.url}/</loc>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    sitemap += `  </url>\n`;
});

sitemap += '</urlset>';
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://lucovista.in/sitemap.xml

# Crawl-delay for polite crawling
Crawl-delay: 2
`;
fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt);

console.log(`\n✅ Done! Generated ${pages.length} static pages in /dist/`);
console.log('📊 Deploy the /dist/ folder to Netlify');
console.log('🔗 Submit sitemap.xml to Google Search Console immediately');