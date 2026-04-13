import mysql from 'mysql2/promise';

//! verze pro xampp
export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_city_explorer',
});

