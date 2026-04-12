import express from 'express';
import cityRoutes from './routes/cityRoutes.js';
import placeRoutes from './routes/placeRoutes.js';

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use('/api/cities', cityRoutes);
app.use('/api/places', placeRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'NOT_FOUND' });
});

app.listen(3000, () => {
    console.log('Express server running on http://localhost:3000');
});