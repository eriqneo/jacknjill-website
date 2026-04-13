const fs = require('fs');
const path = require('path');
const dir = '/home/neo/Downloads/Jack & Jill';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let updated = 0;

files.forEach(file => {
    const fp = path.join(dir, file);
    let html = fs.readFileSync(fp, 'utf8');

    // Wrap overlay-top-header + quick-links-row in a sticky overlay-top-bar div
    html = html.replace(
        /(<div class="overlay-top-header">[\s\S]*?<\/div>)(\s*)(<div class="quick-links-row">[\s\S]*?<\/div>)/,
        function(match, header, ws, quickLinks) {
            return '<div class="overlay-top-bar">\n            ' + header + ws + '    ' + quickLinks + '\n        </div>';
        }
    );

    // Inject scroll-hint element just after overlay-inner-nav opens
    if (!html.includes('overlay-scroll-hint')) {
        html = html.replace(
            /(<div class="overlay-inner-nav">)/,
            '$1\n        <div class="overlay-scroll-hint" id="overlay-scroll-hint"><span class="overlay-scroll-arrow">&#8595;</span></div>'
        );
    }

    fs.writeFileSync(fp, html);
    updated++;
    console.log('Updated: ' + file);
});

console.log('Done. Updated ' + updated + ' files.');
