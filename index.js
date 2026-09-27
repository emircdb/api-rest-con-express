require('dotenv').config();

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3008;
const databasePath = path.resolve(
	__dirname,
	process.env.DB_PATH || 'database/trailerflix.json'
);
const TRAILERFLIX = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));

app.use(express.json());

app.get('/', (req, res) => {
	res
		.type('html')
		.send('<h1>Bienvenido a Trailerflix</h1>');
});

app.get('/catalogo', (req, res) => {
	res.json(TRAILERFLIX);
});

app.get('/titulo/:title', (req, res) => {
	const title = req.params.title.toLowerCase();
	const results = TRAILERFLIX.filter((production) =>
		production.titulo.toLowerCase().includes(title)
	);

	if (results.length === 0) {
		return res.status(404).json({ error: 'No se encontraron producciones con ese título.' });
	}

	return res.json(results);
});

app.get('/categoria/:cat', (req, res) => {
	const category = req.params.cat.toLowerCase();
	const results = TRAILERFLIX.filter(
		(production) => production.categoria.toLowerCase() === category
	);

	if (results.length === 0) {
		return res.status(404).json({ error: 'No se encontraron producciones de esa categoría.' });
	}

	return res.json(results);
});

app.get('/reparto/:act', (req, res) => {
	const actor = req.params.act.toLowerCase();
	const results = TRAILERFLIX.filter((production) =>
		production.reparto.toLowerCase().includes(actor)
	).map(({ titulo, reparto }) => ({ titulo, reparto }));

	if (results.length === 0) {
		return res.status(404).json({ error: 'No se encontraron producciones con ese actor o actriz.' });
	}

	return res.json(results);
});

app.get('/trailer/:id', (req, res) => {
	const id = Number(req.params.id);
	const production = TRAILERFLIX.find((item) => item.id === id);

	if (!production) {
		return res.status(404).json({ error: 'No se encontró una producción con ese ID.' });
	}

	const trailer = production?.trailer;
	if (!trailer) {
		return res.json({
			id: production.id,
			titulo: production.titulo,
			mensaje: 'El tráiler no está disponible para esta producción.'
		});
	}

	return res.json({
		id: production.id,
		titulo: production.titulo,
		trailer
	});
});

app.use((req, res) => {
	res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.listen(PORT, () => {
	console.log(`API de Trailerflix disponible en http://localhost:${PORT}`);
});
