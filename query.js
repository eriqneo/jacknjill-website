const POCKETBASE_URL = 'https://jacknjill.pockethost.io';

async function run() {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/staff/records?perPage=100&sort=display_order`);
    const data = await res.json();
    console.log(JSON.stringify(data.items, null, 2));
}
run();
