const API = '/api'; // asi by to tady nemuselo bejt, jestli budu měnit smazat i na back endu

let cachedCities = null;
let activeCityId = null;
let activeCityName = null;
let activePlaceId = null;

let mainPanel, detailPanel, placeForm, cityForm;

function showToast(msg) {
    const toastEl = document.getElementById('toastMsg');
    toastEl.querySelector('.toast-body').textContent = msg;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function loading(container) {
    container.innerHTML = '';
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'text-center p-5';
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary';
    spinner.setAttribute('role', 'status');
    const span = document.createElement('span');
    span.className = 'visually-hidden';
    span.textContent = 'Načítám...';
    spinner.appendChild(span);
    const text = document.createElement('div');
    text.textContent = 'Načítám...';
    loadingMsg.appendChild(spinner);
    loadingMsg.appendChild(text);
    container.appendChild(loadingMsg);
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

function placeholderImg(w, h) { // vygenerováno
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${w}" height="${h}" fill="#ddd"/>
        <line x1="0" y1="0" x2="${w}" y2="${h}" stroke="#aaa" stroke-width="1.5"/>
        <line x1="${w}" y1="0" x2="0" y2="${h}" stroke="#aaa" stroke-width="1.5"/>
    </svg>`;
}

document.addEventListener('DOMContentLoaded', () => {
    mainPanel = document.getElementById('mainPanel');
    detailPanel = document.getElementById('detailPanel');
    placeForm = document.getElementById('placeForm');
    cityForm = document.getElementById('cityForm');

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
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
}


async function renderCities() {
    activeCityId = null;
    activeCityName = null;
    resetDetail();

    if (!cachedCities) {
        loading(mainPanel);
        try {
            const res = await fetch(`${API}/cities`);
            cachedCities = await res.json();
        } catch {
            mainPanel.innerHTML = '<div class="text-center p-4 text-muted">Chyba při načítání měst.</div>';
            return;
        }
    }

    mainPanel.innerHTML = '';
    const title = document.createElement('h2');
    title.className = 'mb-4';
    title.textContent = 'Vyberte město';
    mainPanel.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'city-grid';

    //? Fragment je lepší když přidávám víc věcí najednou aby se to nemuselo přepočítávat pokaždý
    const fragment = document.createDocumentFragment();
    const template = document.getElementById('cityCardTemplate');
    cachedCities.forEach(city => {
        const card = document.importNode(template.content, true).firstElementChild;
        card.id = `cityCard-${city.id}`;
        card.onclick = () => selectCity(city.id, city.name);
        card.querySelector('.card-img-top').innerHTML = placeholderImg(200, 120);
        card.querySelector('.card-title').textContent = city.name;
        fragment.appendChild(card);
    });
    grid.appendChild(fragment);
    mainPanel.appendChild(grid);
}


async function selectCity(cityId, cityName) {
    activeCityId = cityId;
    activeCityName = cityName;
    resetDetail();

    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`cityCard-${cityId}`);
    if (card) card.classList.add('active');

    const existing = document.getElementById('citySection');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.id = 'citySection';
    section.className = 'card mt-4';
    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Načítám...</span></div></div>`;
    section.appendChild(body);
    mainPanel.appendChild(section);
    
    try {
        const res = await fetch(`${API}/cities/${cityId}/places`);
        const places = await res.json();

        renderCitySection(body, cityId, cityName, places);
    } catch {
        body.innerHTML = '<div class="text-center p-4 text-muted">Chyba při načítání míst.</div>';
    }
}

function renderCitySection(section, cityId, cityName, places) {
    section.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-3';

    const title = document.createElement('h3');
    title.textContent = cityName;
    header.appendChild(title);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary btn-sm';
    addBtn.textContent = '+ nové místo';
    addBtn.onclick = () => openAddPlaceModal(cityId);
    header.appendChild(addBtn);

    section.appendChild(header);

    if (places.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-center p-4 text-muted';
        empty.textContent = 'Zatím zde nejsou žádná místa.';
        section.appendChild(empty);
    } else {
        const grid = document.createElement('div');
        grid.className = 'places-grid';

        const fragment = document.createDocumentFragment();
        const template = document.getElementById('placeCardTemplate');
        places.forEach(p => {
            const card = document.importNode(template.content, true).firstElementChild;
            card.id = `placeCard-${p.id}`;
            card.onclick = () => openPlaceDetail(p.id);
            card.querySelector('.card-img-top').innerHTML = placeholderImg(155, 90);
            card.querySelector('.card-title').textContent = p.name;
            card.querySelector('.card-title').title = p.name;
            card.querySelector('.card-text').textContent = p.type;
            fragment.appendChild(card);
        });
        grid.appendChild(fragment);
        section.appendChild(grid);
    }
}


async function openPlaceDetail(placeId) {
    activePlaceId = placeId;

    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`placeCard-${placeId}`);
    if (card) card.classList.add('active');

    detailPanel.classList.add('open');
    detailPanel.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Načítám...</span></div></div>`;

    try {
        const [placeRes, commentsRes] = await Promise.all([
            fetch(`${API}/places/${placeId}`),
            fetch(`${API}/places/${placeId}/comments`)
        ]);
        const place = await placeRes.json();
        const comments = await commentsRes.json();

        renderDetailPanel(place, comments);
    } catch {
        detailPanel.innerHTML = '<div class="text-center p-4 text-muted">Chyba při načítání detailu.</div>';
    }
}

function renderDetailPanel(place, comments) {
    const template = document.getElementById('detailTemplate');
    const clone = document.importNode(template.content, true);

    clone.querySelector('.card-title').textContent = place.name;
    clone.querySelector('.btn-outline-secondary').onclick = openEditPlaceModal;
    clone.querySelector('.btn-outline-danger').onclick = () => deletePlace(place.id);

    clone.querySelector('.card-body > div').innerHTML = placeholderImg(380, 160);
    const cardTexts = clone.querySelectorAll('.card-text');
    cardTexts[0].querySelector('span').textContent = place.address;
    cardTexts[1].textContent = place.description;

    const avg = place.stats.avgRating;
    const count = place.stats.ratingCount;
    clone.querySelector('.rating-summary').innerHTML = starsHTML(avg, count);

    const starButtons = clone.querySelectorAll('.btn-outline-warning');
    starButtons.forEach((btn, index) => {
        const stars = index + 1;
        btn.onclick = () => submitRating(place.id, stars);
    });

    const commentsList = clone.querySelector('#commentsList');
    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="text-center p-4 text-muted" style="padding:0.8rem 0;">Zatím žádné komentáře.</div>';
    } else {
        comments.forEach(c => {
            const commentDiv = createCommentItem(c);
            commentsList.appendChild(commentDiv);
        });
    }
    const commentForm = clone.querySelector('#commentForm');
    commentForm.onsubmit = (e) => submitComment(e, place.id);

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

//? Používám stejnou metodu i formulář pro edit i přidání, je to složitější ale přijde mi to lepší
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

    try {
        //? Kvůli double ukldání potencionálně
        const submitBtn = document.getElementById('placeFormSubmit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Ukládám...';

        const res = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            throw new Error(`Chyba: ${res.status} ${res.statusText}`);
        }

        showToast(id ? 'Místo bylo upraveno.' : 'Místo bylo přidáno.');
        bootstrap.Modal.getInstance(document.getElementById('placeModal')).hide();
        placeForm.classList.remove('was-validated');

        //? Ne uplně optimální ale stabilní
        if (activeCityId) {
            await refreshCityPlaces(activeCityId);
            if (id) await openPlaceDetail(id);
        }

    } catch (error) {
        showToast(error.message || 'Chyba při ukládání místa.');
    } finally {
        // Zpátky tlačítko
        const submitBtn = document.getElementById('placeFormSubmit');
        submitBtn.disabled = false;
        submitBtn.textContent = id ? 'Uložit změny' : 'Uložit místo';
    }
}

async function refreshCityPlaces(cityId) {
    const section = document.getElementById('citySection');
    if (!section) return;
    const body = section.querySelector('.card-body');
    if (!body) return;
    try {
        const res = await fetch(`${API}/cities/${cityId}/places`);
        const places = await res.json();
        renderCitySection(body, cityId, activeCityName, places);
    } catch { /* ignore */
    }
}


async function deletePlace(placeId) {
    if (!confirm('Opravdu smazat toto místo? Budou smazány i všechny komentáře a hodnocení.')) return;
    try {
        await fetch(`${API}/places/${placeId}`, {method: 'DELETE'});
        showToast('Místo bylo smazáno.');
        resetDetail();
        if (activeCityId) {
            const res = await fetch(`${API}/cities/${activeCityId}/places`);
            const places = await res.json();
            const section = document.getElementById('citySection');
            if (section) {
                const body = section.querySelector('.card-body');
                if (body) renderCitySection(body, activeCityId, activeCityName, places);
            }
        }
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
        if (list && list.querySelectorAll('.list-group-item').length === 0) {
            list.innerHTML = '<div class="text-center p-4 text-muted" style="padding:0.8rem 0;">Zatím žádné komentáře.</div>';
        }
        showToast('Komentář byl smazán.');
    } catch {
        showToast('Chyba při mazání komentáře.');
    }
}

async function refreshComments(placeId) {
    try {
        const res = await fetch(`${API}/places/${placeId}/comments`);
        const comments = await res.json();
        const list = document.getElementById('commentsList');
        if (!list) return;

        if (comments.length === 0) {
            list.innerHTML = '<div class="empty-state" style="padding:0.8rem 0;">Zatím žádné komentáře.</div>';
            return;
        }

        list.innerHTML = '';
        comments.forEach(c => {
            const commentDiv = createCommentItem(c);
            list.appendChild(commentDiv);
        });
    } catch { /* ignore */
    }
}

//* Celkově práce s hodnocením je neoptimální ale neměl jsem čas se tomu tolik věnovat
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
    div.querySelector('small.text-muted > span').textContent = c.author_name;
    div.querySelector('p.mb-1').textContent = c.text;
    div.querySelector('div.d-flex.align-items-center > small.text-muted').textContent = date;
    div.querySelector('.btn-outline-danger').onclick = () => deleteComment(c.id);
    return div;
}
