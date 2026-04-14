const PROJECT_ID = 'zrijfacv';
const DATASET    = 'jj';
const API_VER    = '2024-01-01';
async function run() {
    const groq = `*[_type == "staff"]`;
    const res = await fetch(`https://${PROJECT_ID}.apicdn.sanity.io/v${API_VER}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`);
    const data = await res.json();
    console.log(JSON.stringify(data.result, null, 2));
}
run();
