import {pool} from '../db.js';

export const getAllCities = async () => {
    const [rows] = await pool.query('SELECT * FROM cities ORDER BY name ');
    return rows;
};

export const createCity = async (cityData) => {
    const {name, description} = cityData;
    const [result] = await pool.query(
        'INSERT INTO cities (name, description) VALUES (?, ?)',

        [name, description || null]
    );
    return result.insertId;
};

export const updateCity = async (id, cityData) => {
    const {name, description} = cityData;
    await pool.query(
        'UPDATE cities SET name = ?, description = ? WHERE id = ?',
        [name, description || null, id]
    );
};

export const deleteCity = async (id) => {
    await pool.query('DELETE FROM cities WHERE id = ?', [id]);
};
