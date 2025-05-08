const mysql = require('mysql2');

const koneksi = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database_egin' 
});

koneksi.connect((err) => {
    if (err) {
        console.error('Koneksi gagal: ', err);
        return;
    }
    console.log('Koneksi ke database berhasil');
});

module.exports = koneksi;
