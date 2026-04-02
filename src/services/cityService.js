import { pool } from '../db.js';

export const getAllCities = async () => {
    const [rows] = await pool.query('SELECT * FROM cities ORDER BY name ASC');
    return rows;
};