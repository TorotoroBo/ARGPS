document.addEventListener('DOMContentLoaded', () => {
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    const enterARBtn = document.getElementById('enterARBtn');
    const photoInput = document.getElementById('photoInput');
    const photoList = document.getElementById('photoList');

    addPhotoBtn.addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            getLocationAndUpload(file);
        }
    });

    enterARBtn.addEventListener('click', () => {
        window.location.href = 'ar-view.html';
    });

    function getLocationAndUpload(file) {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                uploadPhoto(file, lat, lon);
            }, (error) => {
                console.error('Error getting location:', error);
                alert('No se pudo obtener la ubicación. Por favor, inténtalo de nuevo.');
            });
        } else {
            alert('Geolocalización no está soportada en este dispositivo.');
        }
    }

    function uploadPhoto(file, lat, lon) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const photoData = {
                src: e.target.result,
                lat: lat,
                lon: lon,
                timestamp: new Date().toISOString()
            };
            savePhotoData(photoData);
            displayPhoto(photoData);
        };
        reader.readAsDataURL(file);
    }

    function savePhotoData(photoData) {
        let photos = JSON.parse(localStorage.getItem('arPhotos')) || [];
        photos.push(photoData);
        localStorage.setItem('arPhotos', JSON.stringify(photos));
    }

    function displayPhoto(photoData) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photoData.src}" alt="Uploaded photo" style="max-width: 100px; max-height: 100px;">
            <p>Lat: ${photoData.lat}, Lon: ${photoData.lon}</p>
            <p>Fecha: ${new Date(photoData.timestamp).toLocaleString()}</p>
        `;
        photoList.appendChild(photoItem);
    }

    function loadExistingPhotos() {
        const photos = JSON.parse(localStorage.getItem('arPhotos')) || [];
        photos.forEach(displayPhoto);
    }

    loadExistingPhotos();
});
