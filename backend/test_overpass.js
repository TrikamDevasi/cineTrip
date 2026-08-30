

const query = `
[out:json][timeout:25];
(
  node["amenity"="cinema"](around:10000,19.076,72.8777);
  way["amenity"="cinema"](around:10000,19.076,72.8777);
  relation["amenity"="cinema"](around:10000,19.076,72.8777);
);
out center;
`.trim();

async function test() {
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CineTripApp/1.0 (contact@cinetrip.com)',
        'Accept': 'application/json'
      },
      body: `data=${encodeURIComponent(query)}`
    });
    
    if (!res.ok) {
      console.log('HTTP ERROR', res.status, await res.text());
      return;
    }
    
    const data = await res.json();
    console.log('Found:', data.elements.length);
    if (data.elements.length > 0) {
      data.elements.slice(0, 5).forEach(e => {
        console.log(e.tags.name || e.tags['name:en'] || 'Unknown', '-', e.tags['addr:full'] || '');
      });
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
