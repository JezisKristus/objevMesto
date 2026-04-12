const appDiv = document.getElementById('app');
const API_URL = '/api';

// Po načtení stránky zobrazíme města
document.addEventListener('DOMContentLoaded', () => {
    renderCities();

    // Obsluha formuláře pro přidání místa
    document.getElementById('addPlaceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cityId = document.getElementById('placeCityId').value;
        const newPlace = {
            city_id: cityId,
            name: document.getElementById('placeName').value,
            type: document.getElementById('placeType').value,
            address: document.getElementById('placeAddress').value,
            description: document.getElementById('placeDesc').value,
            image_url: null
        };

        try {
            await fetch(`${API_URL}/places`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlace)
            });
            const modal = bootstrap.Modal.getInstance(document.getElementById('addPlaceModal'));
            modal.hide();
            e.target.reset();
            renderCityPlaces(cityId); // Obnovit seznam
        } catch (err) {
            console.error('Chyba při ukládání místa:', err);
        }
    });
});

// --- 1. Hlavní stránka (Seznam měst) ---
async function renderCities() {
    appDiv.innerHTML = '<div class="text-center"><div class="spinner-border"></div></div>';
    try {
        const res = await fetch(`${API_URL}/cities`);
        const cities = await res.json();

        let html = '<h2 class="mb-4">Vyberte město</h2><div class="row">';
        cities.forEach(city => {
            html += `
                <div class="col-md-4 mb-3">
                    <div class="card place-card h-100" onclick="renderCityPlaces(${city.id}, '${city.name}')">
                        <div class="card-body text-center">
                            <h4 class="card-title m-0">${city.name}</h4>
                        </div>
                    </div>
                </div>`;
        });
        html += '</div>';
        appDiv.innerHTML = html;
    } catch (err) {
        appDiv.innerHTML = '<div class="alert alert-danger">Chyba při načítání měst.</div>';
    }
}

// --- 2. Detail města (Seznam míst) ---
async function renderCityPlaces(cityId, cityName = '') {
    appDiv.innerHTML = '<div class="text-center"><div class="spinner-border"></div></div>';
    try {
        const res = await fetch(`${API_URL}/cities/${cityId}/places`);
        const places = await res.json();

        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Místa v tomto městě</h2>
                <button class="btn btn-success" onclick="openAddPlaceModal(${cityId})">+ Nové místo</button>
            </div>
            <div class="row">
        `;

        if (places.length === 0) {
            html += '<p>Zatím zde nejsou žádná místa.</p>';
        } else {
            places.forEach(place => {
                html += `
                    <div class="col-md-6 mb-3">
                        <div class="card place-card" onclick="renderPlaceDetail(${place.id})">
                            <div class="card-body">
                                <h5 class="card-title">${place.name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${place.type}</h6>
                                <p class="card-text text-truncate">${place.description}</p>
                            </div>
                        </div>
                    </div>`;
            });
        }
        html += '</div><button class="btn btn-outline-secondary mt-3" onclick="renderCities()">Zpět na města</button>';
        appDiv.innerHTML = html;
    } catch (err) {
        appDiv.innerHTML = '<div class="alert alert-danger">Chyba při načítání míst.</div>';
    }
}

function openAddPlaceModal(cityId) {
    document.getElementById('placeCityId').value = cityId;
    const modal = new bootstrap.Modal(document.getElementById('addPlaceModal'));
    modal.show();
}

// --- 3. Detail místa (Komentáře a Hodnocení) ---
async function renderPlaceDetail(placeId) {
    appDiv.innerHTML = '<div class="text-center"><div class="spinner-border"></div></div>';
    try {
        const res = await fetch(`${API_URL}/places/${placeId}`);
        const place = await res.json();

        const avgRating = place.stats.avgRating ? Number(place.stats.avgRating).toFixed(1) : 'Nehodnoceno';
        const ratingCount = place.stats.ratingCount || 0;

        let html = `
            <div class="card mb-4">
                <div class="card-body">
                    <h2>${place.name} <span class="badge bg-secondary fs-6">${place.type}</span></h2>
                    <p class="text-muted"><small>Adresa: ${place.address}</small></p>
                    <p>${place.description}</p>
                    <hr>
                    <h4>Hodnocení: <span class="star-rating">★</span> ${avgRating} <small class="text-muted fs-6">(${ratingCount} hodnocení)</small></h4>
                    
                    <div class="mt-3">
                        Přídat hodnocení: 
                        <button class="btn btn-sm btn-outline-warning" onclick="submitRating(${place.id}, 1)">1★</button>
                        <button class="btn btn-sm btn-outline-warning" onclick="submitRating(${place.id}, 2)">2★</button>
                        <button class="btn btn-sm btn-outline-warning" onclick="submitRating(${place.id}, 3)">3★</button>
                        <button class="btn btn-sm btn-outline-warning" onclick="submitRating(${place.id}, 4)">4★</button>
                        <button class="btn btn-sm btn-outline-warning" onclick="submitRating(${place.id}, 5)">5★</button>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <h4>Komentáře</h4>
                    <div class="list-group mb-4">
        `;

        if (place.comments.length === 0) {
            html += '<p>Zatím bez komentářů.</p>';
        } else {
            place.comments.forEach(c => {
                const date = new Date(c.created_at).toLocaleString('cs-CZ');
                html += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1"><b>${c.author_name}</b></h6>
                            <small class="text-muted">${date}</small>
                        </div>
                        <p class="mb-1">${c.text}</p>
                        <button class="btn btn-sm btn-danger mt-2" onclick="deleteComment(${c.id}, ${place.id})">Smazat</button>
                    </div>
                `;
            });
        }

        html += `
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5>Nový komentář</h5>
                            <form onsubmit="submitComment(event, ${place.id})">
                                <div class="mb-3">
                                    <label class="form-label">Jméno</label>
                                    <input type="text" class="form-control" id="commentName" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Text komentáře</label>
                                    <textarea class="form-control" id="commentText" rows="3" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Odeslat</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn btn-outline-secondary mt-4" onclick="renderCityPlaces(${place.city_id})">Zpět na seznam míst</button>
        `;

        appDiv.innerHTML = html;
    } catch (err) {
        appDiv.innerHTML = '<div class="alert alert-danger">Chyba při načítání detailu místa.</div>';
    }
}

// --- API Volání pro Komentáře a Hodnocení ---

async function submitComment(e, placeId) {
    e.preventDefault();
    const name = document.getElementById('commentName').value;
    const text = document.getElementById('commentText').value;

    await fetch(`${API_URL}/places/${placeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_name: name, text: text })
    });

    renderPlaceDetail(placeId); // Překreslit detail
}

async function deleteComment(commentId, placeId) {
    if(confirm('Opravdu smazat komentář?')) {
        await fetch(`${API_URL}/places/comments/${commentId}`, { method: 'DELETE' });
        renderPlaceDetail(placeId);
    }
}

async function submitRating(placeId, stars) {
    await fetch(`${API_URL}/places/${placeId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars })
    });
    renderPlaceDetail(placeId);
}