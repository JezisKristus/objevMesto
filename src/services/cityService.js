import { pool } from '../db.js';

export const getAllCities = async () => {
    const [rows] = await pool.query('SELECT * FROM cities ORDER BY name ASC');
    return rows;
};

export const createCity = async (placeData) => {
    const { name } = placeData;
    const [result] = await pool.query(
        'INSERT INTO cities (name) VALUES (?)',
        [name,]
    );
    return result.insertId;
};