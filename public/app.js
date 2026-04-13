const API = '/api';

let cachedCities = null;
let activeCityId   = null;
let activeCityName = null;
let activePlaceId  = null;

let mainPanel, detailPanel, placeForm, placeModal, cityForm, cityModal;

function showToast(msg) {
    const el = document.getElementById('toastMsg');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2400);
}

function loading(container) {
    container.innerHTML = '';
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'loading-msg';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    const text = document.createElement('div');
    text.textContent = 'Načítám...';
    loadingMsg.appendChild(spinner);
    loadingMsg.appendChild(text);
    container.appendChild(loadingMsg);
}

function starsHTML(avg, count) {
    if (!count || count === 0) return '<span class="rating-count">Bez hodnocení</span>';
    const full  = Math.round(avg);
    let html = '<span class="stars-display">';
    for (let i = 1; i <= 5; i++) html += i <= full ? '★' : '☆';
    html += '</span>';
    html += `<span class="rating-num">${Number(avg).toFixed(1)}</span>`;
    html += `<span class="rating-count">(${count})</span>`;
    return html;
}

function placeholderImg(w, h) {
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${w}" height="${h}" fill="#ddd"/>
        <line x1="0" y1="0" x2="${w}" y2="${h}" stroke="#aaa" stroke-width="1.5"/>
        <line x1="${w}" y1="0" x2="0" y2="${h}" stroke="#aaa" stroke-width="1.5"/>
    </svg>`;
}

document.addEventListener('DOMContentLoaded', () => {
    mainPanel   = document.getElementById('mainPanel');
    detailPanel = document.getElementById('detailPanel');
    placeForm   = document.getElementById('placeForm');
    cityForm    = document.getElementById('cityForm');

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
    activePlaceId  = null;
    detailPanel.classList.remove('open');
    detailPanel.innerHTML = '';
    document.querySelectorAll('.place-card.active').forEach(c => c.classList.remove('active'));
}


async function renderCities() {
    activeCityId   = null;
    activeCityName = null;
    resetDetail();

    if (!cachedCities) {
        loading(mainPanel);
        try {
            const res = await fetch(`${API}/cities`);
            cachedCities = await res.json();
        } catch {
            mainPanel.innerHTML = '<div class="empty-state">Chyba při načítání měst.</div>';
            return;
        }
    }

    mainPanel.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = 'Vyberte město';
    mainPanel.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'city-grid';

    const fragment = document.createDocumentFragment();
    cachedCities.forEach(city => {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.id = `cityCard-${city.id}`;
        card.onclick = () => selectCity(city.id, escHtml(city.name));

        const imgDiv = document.createElement('div');
        imgDiv.className = 'city-card-img';
        imgDiv.innerHTML = placeholderImg(200, 120);
        card.appendChild(imgDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'city-card-name';
        nameDiv.textContent = escHtml(city.name);
        card.appendChild(nameDiv);

        fragment.appendChild(card);
    });
    grid.appendChild(fragment);
    mainPanel.appendChild(grid);
}


async function selectCity(cityId, cityName) {
    activeCityId   = cityId;
    activeCityName = cityName;
    resetDetail();

    document.querySelectorAll('.city-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`cityCard-${cityId}`);
    if (card) card.classList.add('active');

    const existing = document.getElementById('citySection');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.id = 'citySection';
    section.className = 'city-section';
    section.innerHTML = `<div class="loading-msg"><div class="spinner"></div></div>`;
    mainPanel.appendChild(section);

    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
        const res    = await fetch(`${API}/cities/${cityId}/places`);
        const places = await res.json();

        renderCitySection(section, cityId, cityName, places);
    } catch {
        section.innerHTML = '<div class="empty-state">Chyba při načítání míst.</div>';
    }
}

function renderCitySection(section, cityId, cityName, places) {
    section.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'city-section-header';

    const title = document.createElement('h2');
    title.className = 'city-section-title';
    title.textContent = escHtml(cityName);
    header.appendChild(title);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-accent btn-sm';
    addBtn.textContent = '+ nové místo';
    addBtn.onclick = () => openAddPlaceModal(cityId);
    header.appendChild(addBtn);

    section.appendChild(header);

    if (places.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'Zatím zde nejsou žádná místa.';
        section.appendChild(empty);
    } else {
        const grid = document.createElement('div');
        grid.className = 'places-grid';

        const fragment = document.createDocumentFragment();
        places.forEach(p => {
            const card = document.createElement('div');
            card.className = 'place-card';
            card.id = `placeCard-${p.id}`;
            card.onclick = () => openPlaceDetail(p.id);

            const imgDiv = document.createElement('div');
            imgDiv.className = 'place-card-img';
            imgDiv.innerHTML = placeholderImg(155, 90);
            card.appendChild(imgDiv);

            const body = document.createElement('div');
            body.className = 'place-card-body';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'place-card-name';
            nameDiv.title = escHtml(p.name);
            nameDiv.textContent = escHtml(p.name);
            body.appendChild(nameDiv);

            const typeDiv = document.createElement('div');
            typeDiv.className = 'place-card-type';
            typeDiv.textContent = escHtml(p.type);
            body.appendChild(typeDiv);

            card.appendChild(body);
            fragment.appendChild(card);
        });
        grid.appendChild(fragment);
        section.appendChild(grid);
    }
}


async function openPlaceDetail(placeId) {
    activePlaceId = placeId;

    document.querySelectorAll('.place-card.active').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`placeCard-${placeId}`);
    if (card) card.classList.add('active');

    detailPanel.classList.add('open');
    detailPanel.innerHTML = `<div class="loading-msg"><div class="spinner"></div></div>`;

    try {
        const [placeRes, commentsRes] = await Promise.all([
            fetch(`${API}/places/${placeId}`),
            fetch(`${API}/places/${placeId}/comments`)
        ]);
        const place    = await placeRes.json();
        const comments = await commentsRes.json();

        renderDetailPanel(place, comments);
    } catch {
        detailPanel.innerHTML = '<div class="empty-state">Chyba při načítání detailu.</div>';
    }
}

function renderDetailPanel(place, comments) {
    const avg   = place.stats.avgRating;
    const count = place.stats.ratingCount;

    let commentsHTML = '';
    if (comments.length === 0) {
        commentsHTML = '<div class="empty-state" style="padding:0.8rem 0;">Zatím žádné komentáře.</div>';
    } else {
        comments.forEach(c => {
            const date = new Date(c.created_at).toLocaleString('cs-CZ', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            commentsHTML += `
                <div class="comment-item" id="comment-${c.id}">
                    <div class="comment-meta">
                        <span class="comment-author">
                            <i class="bi bi-person" style="font-size: 13px;"></i>
                            ${escHtml(c.author_name)}
                        </span>
                        <span class="comment-date">${date}</span>
                        <button class="btn-delete-comment" onclick="deleteComment(${c.id})" title="Smazat komentář">
                            <i class="bi bi-trash" style="font-size: 13px;"></i>
                        </button>
                    </div>
                    <div class="comment-text">${escHtml(c.text)}</div>
                </div>`;
        });
    }

    detailPanel.innerHTML = `
        <div class="detail-header">
            <h3 class="detail-place-name">${escHtml(place.name)}</h3>
            <div class="detail-actions">
                <button class="icon-btn" onclick="openEditPlaceModal()" title="Upravit místo">
                    <i class="bi bi-pencil" style="font-size: 14px;"></i>
                </button>
                <button class="icon-btn delete" onclick="deletePlace(${place.id})" title="Smazat místo">
                    <i class="bi bi-trash" style="font-size: 14px;"></i>
                </button>
            </div>
        </div>

        <div class="detail-place-img">${placeholderImg(380, 160)}</div>

        <div class="detail-address">
            <i class="bi bi-geo-alt" style="font-size: 12px; margin-right:3px; opacity:0.6"></i>
            ${escHtml(place.address)}
        </div>

        <div class="detail-desc">${escHtml(place.description)}</div>

        <hr class="detail-divider">

        <div class="rating-summary">
            ${starsHTML(avg, count)}
        </div>

        <div class="star-picker">
            <span class="star-picker-label">Přidat hodnocení:</span>
            ${[1,2,3,4,5].map(n =>
        `<button class="star-btn" onclick="submitRating(${place.id}, ${n})">${n}★</button>`
    ).join('')}
        </div>

        <div class="comments-section">
            <h6>Komentáře</h6>
            <div id="commentsList">${commentsHTML}</div>
        </div>

        <div class="new-comment-form">
            <h6>Nový komentář</h6>
            <form id="commentForm" onsubmit="submitComment(event, ${place.id})" novalidate>
                <div class="mb-3">
                    <label class="form-label" for="commentName">Jméno</label>
                    <input type="text" class="form-control" id="commentName"
                           placeholder="Vaše jméno" required minlength="2" maxlength="255">
                    <div class="invalid-feedback">Vyplňte jméno (min. 2 znaky).</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="commentText">Text komentáře</label>
                    <textarea class="form-control" id="commentText" rows="3"
                              placeholder="Napište komentář..." required></textarea>
                    <div class="invalid-feedback">Vyplňte text komentáře.</div>
                </div>
                <button type="submit" class="btn btn-primary btn-sm">Odeslat</button>
            </form>
        </div>`;

    detailPanel.dataset.place = JSON.stringify(place);
}


function openAddPlaceModal(cityId) {
    placeForm.reset();
    placeForm.classList.remove('was-validated');
    document.getElementById('placeId').value       = '';
    document.getElementById('placeCityId').value   = cityId;
    document.getElementById('placeModalLabel').textContent = 'Přidat nové místo';
    document.getElementById('placeFormSubmit').textContent = 'Uložit místo';
    new bootstrap.Modal(document.getElementById('placeModal')).show();
}

function openEditPlaceModal() {
    const place = JSON.parse(detailPanel.dataset.place || 'null');
    if (!place) return;

    placeForm.reset();
    placeForm.classList.remove('was-validated');
    document.getElementById('placeId').value       = place.id;
    document.getElementById('placeCityId').value   = place.city_id;
    document.getElementById('placeName').value     = place.name;
    document.getElementById('placeType').value     = place.type;
    document.getElementById('placeAddress').value  = place.address;
    document.getElementById('placeDesc').value     = place.description;
    document.getElementById('placeModalLabel').textContent = 'Upravit místo';
    document.getElementById('placeFormSubmit').textContent = 'Uložit změny';
    new bootstrap.Modal(document.getElementById('placeModal')).show();
}

async function savePlaceFromForm() {
    const id     = document.getElementById('placeId').value;
    const cityId = document.getElementById('placeCityId').value;
    const data   = {
        city_id:     cityId,
        name:        document.getElementById('placeName').value.trim(),
        type:        document.getElementById('placeType').value,
        address:     document.getElementById('placeAddress').value.trim(),
        description: document.getElementById('placeDesc').value.trim(),
        image_url:   null
    };

    try {
        let newPlace;
        if (id) {
            await fetch(`${API}/places/${id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(data)
            });
            showToast('Místo bylo upraveno.');
        } else {
            const res = await fetch(`${API}/places`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(data)
            });
            newPlace = await res.json(); 
            showToast('Místo bylo přidáno.');
        }

        bootstrap.Modal.getInstance(document.getElementById('placeModal')).hide();
        placeForm.classList.remove('was-validated');

        if (!id && newPlace) {
            // Add new place incrementally
            const section = document.getElementById('citySection');
            if (section) {
                const grid = section.querySelector('.places-grid');
                if (grid) {
                    const empty = grid.querySelector('.empty-state');
                    if (empty) empty.remove();
                    const card = createPlaceCard(newPlace);
                    grid.appendChild(card);
                }
            }
        } else {
            // For edits, reload detail if open
            if (id) await openPlaceDetail(id);
        }
    } catch {
        showToast('Chyba při ukládání místa.');
    }
}

function createPlaceCard(p) {
    const card = document.createElement('div');
    card.className = 'place-card';
    card.id = `placeCard-${p.id}`;
    card.onclick = () => openPlaceDetail(p.id);

    const imgDiv = document.createElement('div');
    imgDiv.className = 'place-card-img';
    imgDiv.innerHTML = placeholderImg(155, 90);
    card.appendChild(imgDiv);

    const body = document.createElement('div');
    body.className = 'place-card-body';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'place-card-name';
    nameDiv.title = escHtml(p.name);
    nameDiv.textContent = escHtml(p.name);
    body.appendChild(nameDiv);

    const typeDiv = document.createElement('div');
    typeDiv.className = 'place-card-type';
    typeDiv.textContent = escHtml(p.type);
    body.appendChild(typeDiv);

    card.appendChild(body);
    return card;
}


async function refreshCityPlaces(cityId) {
    const section = document.getElementById('citySection');
    if (!section) return;
    try {
        const res    = await fetch(`${API}/cities/${cityId}/places`);
        const places = await res.json();
        renderCitySection(section, activeCityName, activeCityName, places);
    } catch { /* ignore */ }
}


async function deletePlace(placeId) {
    if (!confirm('Opravdu smazat toto místo? Budou smazány i všechny komentáře a hodnocení.')) return;
    try {
        await fetch(`${API}/places/${placeId}`, { method: 'DELETE' });
        showToast('Místo bylo smazáno.');
        resetDetail();
        if (activeCityId) {
            const res    = await fetch(`${API}/cities/${activeCityId}/places`);
            const places = await res.json();
            const section = document.getElementById('citySection');
            if (section) renderCitySection(section, activeCityId, activeCityName, places);
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
        const res = await fetch(`${API}/places/${placeId}/comments`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ author_name: name, text })
        });
        const newComment = await res.json();
        form.reset();
        form.classList.remove('was-validated');
        showToast('Komentář byl přidán.');
        const list = document.getElementById('commentsList');
        if (list) {
            const empty = list.querySelector('.empty-state');
            if (empty) empty.remove();
            const commentDiv = createCommentItem(newComment);
            list.appendChild(commentDiv);
        }
    } catch {
        showToast('Chyba při přidávání komentáře.');
    }
}

async function deleteComment(commentId) {
    if (!confirm('Smazat komentář?')) return;
    try {
        await fetch(`${API}/places/comments/${commentId}`, { method: 'DELETE' });
        document.getElementById(`comment-${commentId}`)?.remove();
        const list = document.getElementById('commentsList');
        if (list && list.querySelectorAll('.comment-item').length === 0) {
            list.innerHTML = '<div class="empty-state" style="padding:0.8rem 0;">Zatím žádné komentáře.</div>';
        }
        showToast('Komentář byl smazán.');
    } catch {
        showToast('Chyba při mazání komentáře.');
    }
}

async function refreshComments(placeId) {
    try {
        const res      = await fetch(`${API}/places/${placeId}/comments`);
        const comments = await res.json();
        const list     = document.getElementById('commentsList');
        if (!list) return;

        if (comments.length === 0) {
            list.innerHTML = '<div class="empty-state" style="padding:0.8rem 0;">Zatím žádné komentáře.</div>';
            return;
        }

        list.innerHTML = '';
        comments.forEach(c => {
            const date = new Date(c.created_at).toLocaleString('cs-CZ', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.id = `comment-${c.id}`;
            div.innerHTML = `
                <div class="comment-meta">
                    <span class="comment-author">
                        <i class="bi bi-person" style="font-size: 13px;"></i>
                        ${escHtml(c.author_name)}
                    </span>
                    <span class="comment-date">${date}</span>
                    <button class="btn-delete-comment" onclick="deleteComment(${c.id})" title="Smazat komentář">
                        <i class="bi bi-trash" style="font-size: 13px;"></i>
                    </button>
                </div>
                <div class="comment-text">${escHtml(c.text)}</div>`;
            list.appendChild(div);
        });
    } catch { /* ignore */ }
}


async function submitRating(placeId, stars) {
    try {
        await fetch(`${API}/places/${placeId}/ratings`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ stars })
        });
        showToast(`Hodnocení ${stars}★ bylo přidáno.`);
        // Refresh the rating display only
        const res   = await fetch(`${API}/places/${placeId}`);
        const place = await res.json();
        const el    = document.querySelector('.rating-summary');
        if (el) el.innerHTML = starsHTML(place.stats.avgRating, place.stats.ratingCount);
        // Update stored data
        if (detailPanel.dataset.place) {
            const stored = JSON.parse(detailPanel.dataset.place);
            stored.stats = place.stats;
            detailPanel.dataset.place = JSON.stringify(stored);
        }
    } catch {
        showToast('Chyba při ukládání hodnocení.');
    }
}


function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
