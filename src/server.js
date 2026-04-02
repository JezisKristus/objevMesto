import express from 'express';

const app = express();

app.use(express.json());
app.use('/public', express.static('public'));

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});






app.use((req, res) => {
    res.status(404)
        .json({
            error: 'NOT_FOUND'
        });
});

app.listen(3000, () => {
    console.log('Express server running on http://localhost:3000');
});
