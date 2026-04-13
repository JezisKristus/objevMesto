import {pool} from '../db.js';

export const getPlacesByCity = async (cityId) => {
    const [rows] = await pool.query(
        'SELECT * FROM places WHERE city_id = ? ORDER BY name ASC',
        [cityId]
    );
    return rows;
};

export const createPlace = async (placeData) => {
    const {city_id, type, name, description, address, image_url} = placeData;
    const [result] = await pool.query(
        'INSERT INTO places (city_id, type, name, description, address, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [city_id, type, name, description, address, image_url]
    );
    return result.insertId;
};

export const updatePlace = async (id, placeData) => {
    const {type, name, description, address, image_url} = placeData;
    await pool.query(
        'UPDATE places SET type = ?, name = ?, description = ?, address = ?, image_url = ? WHERE id = ?',
        [type, name, description, address, image_url, id]
    );
};

export const deletePlace = async (id) => {
    await pool.query('DELETE FROM places WHERE id = ?', [id]);
};

export const getPlaceDetails = async (id) => {
    const [place] = await pool.query('SELECT * FROM places WHERE id = ?', [id]);
    const [ratings] = await pool.query(
        'SELECT AVG(stars) as avgRating, COUNT(id) as ratingCount FROM ratings WHERE place_id = ?',
        [id]
    );

    if (place.length === 0) return null;

    return {...place[0], stats: ratings[0]};
};

export const getPlaceComments = async (id) => {
    const [comments] = await pool.query(
        'SELECT * FROM comments WHERE place_id = ? ORDER BY created_at DESC',
        [id]
    );
    return comments;
};

export const addComment = async (placeId, author_name, text) => {
    const [result] = await pool.query(
        'INSERT INTO comments (place_id, author_name, text) VALUES (?, ?, ?)',
        [placeId, author_name, text]
    );
    return result.insertId;
};

export const deleteComment = async (commentId) => {
    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);
};

export const addRating = async (placeId, stars) => {
    const [result] = await pool.query(
        'INSERT INTO ratings (place_id, stars) VALUES (?, ?)',
        [placeId, stars]
    );
    return result.insertId;
};