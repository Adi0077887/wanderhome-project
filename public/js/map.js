// Check if mapToken exists
if (typeof mapToken !== 'undefined' && mapToken) {
    // Set Mapbox access token
    mapboxgl.accessToken = mapToken;
    
    // Initialize map
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coordinates || [77.1025, 28.7041], // Default to Delhi if no coordinates
        zoom: 9
    });
    
    // Add marker
    const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coordinates || [77.1025, 28.7041])
        .addTo(map);
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());
    
    // Handle map errors
    map.on('error', (e) => {
        console.error('Map error:', e);
        document.getElementById('map').innerHTML = '<p class="text-center text-muted p-4">Map could not be loaded</p>';
    });
} else {
    console.error('Map token is not defined');
    document.getElementById('map').innerHTML = '<p class="text-center text-muted p-4">Map token is missing</p>';
}
