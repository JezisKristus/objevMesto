const API = '/api';

let cachedCities = null;
let activeCityId = null;
let activeCityName = null;
let activePlaceId = null;

let mainPanel, detailPanel, placeForm;

function showToast(msg) {
    const toastEl = document.getElementById('toastMsg');
    toastEl.querySelector('.toast-body').textContent = msg;
    new bootstrap.Toast(toastEl, {delay: 2500}).show();
}

function starsHTML(avg, count) {
    if (!count || count === 0) return '<span class="rating-count">Bez hodnocení</span>';
    const full = Math.round(avg);
    let html = '<span class="stars-display">';
    for (let i = 1; i <= 5; i++) html += i <= full ? '★' : '☆';
    html += '</span>';
    html += `<span class="rating-num">${Number(avg).toFixed(1)}</span>`;
    html += `<span class="rating-count">(${count})</span>`;
    return html;
}

document.addEventListener('DOMContentLoaded', () => {
    mainPanel = document.getElementById('mainPanel');
    detailPanel = document.getElementById('detailPanel');
    placeForm = document.getElementById('placeForm');

    document.getElementById('homeLink').addEventListener('click', (e) => {
        e.preventDefault();
        resetDetail();
        renderCities();
    });

    placeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!placeForm.checkValidity()) {
            placeForm.classList.add('was-validated');
            return;
        }
        await savePlaceFromForm();
    });

    renderCities();
});

function resetDetail() {
    activePlaceId = null;
    detailPanel.classList.remove('open');
    detailPanel.innerHTML = '';
    document.querySelectorAll('.city-card, .place-card').forEach(c => c.classList.remove('active'));
}

async function renderCities() {
    activeCityId = null;
    activeCityName = null;
    resetDetail();

    if (!cachedCities) {
        mainPanel.innerHTML = '<div class="loading-state"><div class="spinner-border spinner-border-sm text-secondary" role="status"></div><span>Načítám...</span></div>';
        try {
            const res = await fetch(`${API}/cities`);
            cachedCities = await res.json();
        } catch {
            mainPanel.innerHTML = '<div class="text-center text-muted py-4">Chyba při načítání měst.</div>';
            return;
        }
    }

    mainPanel.innerHTML = '';
    const title = document.createElement('h2');
    title.className = 'h3 mb-4';
    title.textContent = 'Vyberte město';
    mainPanel.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'row g-4 mb-3';

    const fragment = document.createDocumentFragment();
    const template = document.getElementById('cityCardTemplate');
    cachedCities.forEach(city => {
        const card = document.importNode(template.content, true).firstElementChild;
        card.id = `cityCard-${city.id}`;
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 col-12';
        card.onclick = () => selectCity(city.id, city.name);
        card.querySelector('.city-card__name').textContent = city.name;
        col.appendChild(card);
        fragment.appendChild(col);
    });
    grid.appendChild(fragment);
    mainPanel.appendChild(grid);
}

async function selectCity(cityId, cityName) {
    activeCityId = cityId;
    activeCityName = cityName;
    resetDetail();

    document.querySelectorAll('.city-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`cityCard-${cityId}`);
    if (card) card.classList.add('active');

    const existing = document.getElementById('citySection');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.id = 'citySection';
    section.className = 'card p-3 mb-3 g-4';
    section.innerHTML = '<div class="loading-state"><div class="spinner-border spinner-border-sm text-secondary" role="status"></div><span>Načítám...</span></div>';
    mainPanel.appendChild(section);

    try {
        const res = await fetch(`${API}/cities/${cityId}/places`);
        const places = await res.json();
        renderCitySection(section, cityId, cityName, places);
    } catch {
        section.innerHTML = '<div class="text-center text-muted py-4">Chyba při načítání míst.</div>';
    }
}

function renderCitySection(section, cityId, cityName, places) {
    section.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-3';

    const title = document.createElement('h3');
    title.className = 'mb-0';
    title.textContent = cityName;
    header.appendChild(title);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-sm btn-outline-primary';
    addBtn.innerHTML = '<i class="bi bi-plus-circle"></i> nové místo';
    addBtn.onclick = () => openAddPlaceModal(cityId);
    header.appendChild(addBtn);

    section.appendChild(header);

    if (places.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-center text-muted py-4';
        empty.textContent = 'Zatím zde nejsou žádná místa.';
        section.appendChild(empty);
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'row g-3 mb-3';

    const fragment = document.createDocumentFragment();
    const template = document.getElementById('placeCardTemplate');
    places.forEach(p => {
        const card = document.importNode(template.content, true).firstElementChild;
        card.id = `placeCard-${p.id}`;
        const col = document.createElement('div');
        col.className = 'col-lg-2 col-md-4 col-sm-6';
        card.onclick = () => openPlaceDetail(p.id);
        card.querySelector('.place-card__name').textContent = p.name;
        card.querySelector('.place-card__name').title = p.name;
        card.querySelector('.place-card__type').textContent = p.type;
        col.appendChild(card);
        fragment.appendChild(col);
    });
    grid.appendChild(fragment);
    section.appendChild(grid);
}

async function openPlaceDetail(placeId) {
    activePlaceId = placeId;

    document.querySelectorAll('.place-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`placeCard-${placeId}`);
    if (card) card.classList.add('active');

    detailPanel.innerHTML = '<div class="loading-state" style="padding:1.5rem"><div class="spinner-border spinner-border-sm text-secondary" role="status"></div><span>Načítám...</span></div>';
    detailPanel.classList.add('open');

    try {
        const [placeRes, commentsRes] = await Promise.all([
            fetch(`${API}/places/${placeId}`),
            fetch(`${API}/places/${placeId}/comments`)
        ]);
        const place = await placeRes.json();
        const comments = await commentsRes.json();
        renderDetailPanel(place, comments);
    } catch {
        detailPanel.innerHTML = '<div class="text-center text-muted py-4">Chyba při načítání detailu.</div>';
    }
}

function renderDetailPanel(place, comments) {
    const template = document.getElementById('detailTemplate');
    const clone = document.importNode(template.content, true);

    clone.querySelector('.detail-title').textContent = place.name;
    clone.querySelector('.detail-type-badge').textContent = place.type;
    clone.querySelector('.btn-edit').onclick = openEditPlaceModal;
    clone.querySelector('.btn-delete').onclick = () => deletePlace(place.id);
    clone.querySelector('.address-text').textContent = place.address;
    clone.querySelector('.detail-desc').textContent = place.description;

    const avg = place.stats.avgRating;
    const count = place.stats.ratingCount;
    clone.querySelector('.rating-summary').innerHTML = starsHTML(avg, count);

    clone.querySelectorAll('.star-btn').forEach(btn => {
        btn.onclick = () => submitRating(place.id, parseInt(btn.dataset.stars));
    });

    const commentsList = clone.querySelector('#commentsList');
    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="text-center text-muted py-2">Zatím žádné komentáře.</div>';
    } else {
        comments.forEach(c => commentsList.appendChild(createCommentItem(c)));
    }

    clone.querySelector('#commentForm').onsubmit = (e) => submitComment(e, place.id);

    detailPanel.innerHTML = '';
    detailPanel.appendChild(clone);
    detailPanel.dataset.place = JSON.stringify(place);
}

function openAddPlaceModal(cityId) {
    placeForm.reset();
    placeForm.classList.remove('was-validated');
    document.getElementById('placeId').value = '';
    document.getElementById('placeCityId').value = cityId;
    document.getElementById('placeModalLabel').textContent = 'Přidat nové místo';
    document.getElementById('placeFormSubmit').textContent = 'Uložit místo';
    new bootstrap.Modal(document.getElementById('placeModal')).show();
}

function openEditPlaceModal() {
    const place = JSON.parse(detailPanel.dataset.place || 'null');
    if (!place) return;
    placeForm.reset();
    placeForm.classList.remove('was-validated');
    document.getElementById('placeId').value = place.id;
    document.getElementById('placeCityId').value = place.city_id;
    document.getElementById('placeName').value = place.name;
    document.getElementById('placeType').value = place.type;
    document.getElementById('placeAddress').value = place.address;
    document.getElementById('placeDesc').value = place.description;
    document.getElementById('placeModalLabel').textContent = 'Upravit místo';
    document.getElementById('placeFormSubmit').textContent = 'Uložit změny';
    new bootstrap.Modal(document.getElementById('placeModal')).show();
}

async function savePlaceFromForm() {
    const id = document.getElementById('placeId').value;
    const data = {
        city_id: document.getElementById('placeCityId').value,
        name: document.getElementById('placeName').value.trim(),
        type: document.getElementById('placeType').value.trim(),
        address: document.getElementById('placeAddress').value.trim(),
        description: document.getElementById('placeDesc').value.trim(),
        image_url: null
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API}/places/${id}` : `${API}/places`;

    const submitBtn = document.getElementById('placeFormSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Ukládám...';

    try {
        const res = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Chyba: ${res.status}`);

        showToast(id ? 'Místo bylo upraveno.' : 'Místo bylo přidáno.');
        bootstrap.Modal.getInstance(document.getElementById('placeModal')).hide();
        placeForm.classList.remove('was-validated');

        if (activeCityId) {
            await refreshCityPlaces(activeCityId);
            if (id) await openPlaceDetail(id);
        }
    } catch (error) {
        showToast(error.message || 'Chyba při ukládání.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = id ? 'Uložit změny' : 'Uložit místo';
    }
}

async function refreshCityPlaces(cityId) {
    const section = document.getElementById('citySection');
    if (!section) return;
    try {
        const res = await fetch(`${API}/cities/${cityId}/places`);
        const places = await res.json();
        renderCitySection(section, cityId, activeCityName, places);
    } catch { /* ignore */
    }
}

async function deletePlace(placeId) {
    if (!confirm('Opravdu smazat toto místo? Budou smazány i všechny komentáře a hodnocení.')) return;
    try {
        await fetch(`${API}/places/${placeId}`, {method: 'DELETE'});
        showToast('Místo bylo smazáno.');
        resetDetail();
        if (activeCityId) await refreshCityPlaces(activeCityId);
    } catch {
        showToast('Chyba při mazání místa.');
    }
}

async function submitComment(e, placeId) {
    e.preventDefault();
    const form = document.getElementById('commentForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    const name = document.getElementById('commentName').value.trim();
    const text = document.getElementById('commentText').value.trim();
    try {
        await fetch(`${API}/places/${placeId}/comments`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({author_name: name, text})
        });
        form.reset();
        form.classList.remove('was-validated');
        showToast('Komentář byl přidán.');
        await refreshComments(placeId);
    } catch {
        showToast('Chyba při přidávání komentáře.');
    }
}

async function deleteComment(commentId) {
    if (!confirm('Smazat komentář?')) return;
    try {
        await fetch(`${API}/places/comments/${commentId}`, {method: 'DELETE'});
        document.getElementById(`comment-${commentId}`)?.remove();
        const list = document.getElementById('commentsList');
        if (list && list.querySelectorAll('.comment-item').length === 0) {
            list.innerHTML = '<div class="text-center text-muted py-2">Zatím žádné komentáře.</div>';
        }
        showToast('Komentář byl smazán.');
    } catch {
        showToast('Chyba při mazání komentáře.');
    }
}

async function refreshComments(placeId) {
    const list = document.getElementById('commentsList');
    if (!list) return;
    try {
        const res = await fetch(`${API}/places/${placeId}/comments`);
        const comments = await res.json();
        list.innerHTML = '';
        if (comments.length === 0) {
            list.innerHTML = '<div class="text-center text-muted py-2">Zatím žádné komentáře.</div>';
            return;
        }
        comments.forEach(c => list.appendChild(createCommentItem(c)));
    } catch { /* ignore */
    }
}

async function submitRating(placeId, stars) {
    try {
        await fetch(`${API}/places/${placeId}/ratings`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({stars})
        });
        showToast(`Hodnocení ${stars}★ bylo přidáno.`);
        const res = await fetch(`${API}/places/${placeId}`);
        const place = await res.json();
        const el = document.querySelector('.rating-summary');
        if (el) el.innerHTML = starsHTML(place.stats.avgRating, place.stats.ratingCount);
        if (detailPanel.dataset.place) {
            const stored = JSON.parse(detailPanel.dataset.place);
            stored.stats = place.stats;
            detailPanel.dataset.place = JSON.stringify(stored);
        }
    } catch {
        showToast('Chyba při ukládání hodnocení.');
    }
}

function createCommentItem(c) {
    const template = document.getElementById('commentTemplate');
    const div = document.importNode(template.content, true).firstElementChild;
    div.id = `comment-${c.id}`;
    const date = new Date(c.created_at).toLocaleString('cs-CZ', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    div.querySelector('.author-name').textContent = c.author_name;
    div.querySelector('.comment-text').textContent = c.text;
    div.querySelector('.comment-date').textContent = date;
    div.querySelector('.btn-delete-comment').onclick = () => deleteComment(c.id);
    return div;
}
