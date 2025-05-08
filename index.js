const express = require('express');
const koneksi = require('./config/database');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Konfigurasi Multer untuk Upload Gambar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas file max 5MB
});

// CREATE - Insert Data Film
app.post('/api/film', upload.single('image'), (req, res) => {
    const { judul, tahun, sutradara } = req.body;
    if (!judul || !tahun || !sutradara) {
        return res.status(400).json({ success: false, message: 'Field judul, tahun, dan sutradara wajib diisi.' });
    }

    let foto = '';
    if (req.file) {
        foto = `http://localhost:${PORT}/images/${req.file.filename}`;
    }

    const querySql = 'INSERT INTO film (judul, tahun_rilis, sutradara, foto) VALUES (?, ?, ?, ?)';
    koneksi.query(querySql, [judul, tahun, sutradara, foto], (err, result) => {
        if (err) {
            console.error('Gagal insert:', err);
            return res.status(500).json({ success: false, message: 'Gagal insert data', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil insert data!' });
    });
});

// READ - Get Semua Data Film
app.get('/api/film', (req, res) => {
    const querySql = 'SELECT * FROM film';
    koneksi.query(querySql, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ada kesalahan', error: err });
        }
        res.status(200).json({ success: true, data: rows });
    });
});

// UPDATE - Update Data Film
app.put('/api/film/:id', (req, res) => {
    console.log('Request Body:', req.body); // Menambahkan log untuk memeriksa body
    const { judul, tahun, sutradara } = req.body;
    if (!judul || !tahun || !sutradara) {
        return res.status(400).json({ success: false, message: 'Field judul, tahun, dan sutradara wajib diisi.' });
    }

    const id = req.params.id;
    const querySearch = 'SELECT * FROM film WHERE id = ?';
    const queryUpdate = 'UPDATE film SET judul = ?, tahun_rilis = ?, sutradara = ? WHERE id = ?';

    koneksi.query(querySearch, [id], (err, rows) => {
        if (err) {
            console.error('Error cari data:', err);
            return res.status(500).json({ success: false, message: 'Ada kesalahan', error: err });
        }
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan!' });
        }

        koneksi.query(queryUpdate, [judul, tahun, sutradara, id], (err) => {
            if (err) {
                console.error('Error update data:', err);
                return res.status(500).json({ success: false, message: 'Gagal update data', error: err });
            }
            res.status(200).json({ success: true, message: 'Berhasil update data!' });
        });
    });
});

// DELETE - Hapus Data Film
app.delete('/api/film/:id', (req, res) => {
    const id = req.params.id;
    const querySearch = 'SELECT * FROM film WHERE id= ?';
    const queryDelete = 'DELETE FROM film WHERE id= ?';

    koneksi.query(querySearch, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ada kesalahan', error: err });
        }
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan!' });
        }

        koneksi.query(queryDelete, [id], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Gagal hapus data', error: err });
            }
            res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
        });
    });
});

// Jalankan Server
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
