let userPosition = null;
let nearestPhotos = [];

document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    const backButton = document.getElementById('backButton');
    const loadingMessage = document.getElementById('loadingMessage');
    const arrows = [
        document.getElementById('arrow1'),
        document.getElementById('arrow2'),
        document.getElementById('arrow3')
    ];

    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    function loadARContent() {
        const photos = JSON.parse(localStorage.getItem('arPhotos')) || [];
        
        photos.forEach((photo, index) => {
            const entity = document.createElement('a-image');
            entity.setAttribute('src', photo.src);
            entity.setAttribute('look-at', '[gps-camera]');
            entity.setAttribute('scale', '1 1 1');
            entity.setAttribute('gps-entity-place', `latitude: ${photo.lat}; longitude: ${photo.lon}`);
            
            scene.appendChild(entity);
        });
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function calculateBearing(lat1, lon1, lat2, lon2) {
        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        const bearing = Math.atan2(y, x);
        return (bearing * 180 / Math.PI + 360) % 360;
    }

    function updateNearestPhotos() {
        if (!userPosition) return;

        const photos = JSON.parse(localStorage.getItem('arPhotos')) || [];
        const photosWithDistance = photos.map(photo => ({
            ...photo,
            distance: calculateDistance(userPosition.latitude, userPosition.longitude, photo.lat, photo.lon),
            bearing: calculateBearing(userPosition.latitude, userPosition.longitude, photo.lat, photo.lon)
        }));

        nearestPhotos = photosWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
    }

    function updateArrows() {
        nearestPhotos.forEach((photo, index) => {
            const arrow = arrows[index];
            const direction = photo.bearing - userPosition.heading;
            arrow.style.transform = `rotate(${direction}deg)`;
            arrow.textContent = '↑';
            arrow.style.left = `${10 + index * 60}px`;
            arrow.style.display = 'flex';
            
            // Mostrar información de depuración
            console.log(`Flecha ${index + 1}: Distancia: ${photo.distance.toFixed(2)}km, Dirección: ${direction.toFixed(2)}°`);
        });
    }

    function watchPosition() {
        navigator.geolocation.watchPosition(
            (position) => {
                userPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    heading: position.coords.heading || 0
                };
                updateNearestPhotos();
                updateArrows();
                
                // Ocultar el mensaje de carga una vez que tengamos la posición del usuario
                loadingMessage.style.display = 'none';
                
                // Mostrar información de depuración
                console.log(`Posición del usuario: Lat: ${userPosition.latitude.toFixed(6)}, Lon: ${userPosition.longitude.toFixed(6)}, Heading: ${userPosition.heading.toFixed(2)}°`);
            },
            (error) => {
                console.error('Error getting location:', error);
                loadingMessage.innerHTML = `
                    <h2>Error de Geolocalización</h2>
                    <p>No se pudo obtener su ubicación. Por favor, asegúrese de que su dispositivo tenga el GPS activado y que haya dado permiso para acceder a su ubicación.</p>
                    <p>Error: ${error.message}</p>
                `;
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
    }

    scene.addEventListener('loaded', () => {
        console.log('Escena AR cargada');
        loadARContent();
        watchPosition();
    });

    scene.addEventListener('camera-init', (data) => {
        console.log('Cámara AR inicializada');
    });

    scene.addEventListener('camera-error', (error) => {
        console.error('Error de cámara AR:', error);
    });

    // Actualizar las flechas cada segundo
    setInterval(updateArrows, 1000);
});
