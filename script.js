const predefinedPhotos = [
    { src: 'images/image1.jpg', lat: 40.7128, lon: -74.0060 },
    { src: 'images/image2.jpg', lat: 40.7589, lon: -73.9851 },
    { src: 'images/image3.jpg', lat: 40.7484, lon: -73.9857 },
    { src: 'images/image4.jpg', lat: 40.7185, lon: -73.9969 },
    { src: 'images/image5.jpg', lat: 40.7484, lon: -73.9857 },
    { src: 'images/image6.jpg', lat: 40.7516, lon: -73.9776 },
    { src: 'images/image7.jpg', lat: 40.7395, lon: -73.9896 },
    { src: 'images/image8.jpg', lat: 40.7614, lon: -73.9776 },
    { src: 'images/image9.jpg', lat: 40.7587, lon: -73.9787 },
    { src: 'images/image10.jpg', lat: 40.7308, lon: -73.9973 },
];

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
