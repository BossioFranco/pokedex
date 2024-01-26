const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3001;

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000', // Reemplaza con el origen de tu aplicación React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Habilita el envío de cookies
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.get('/pokemon', async (req, res) => {
    try {
        const { page = 1, pageSize = 20, search, type } = req.query;
        const offset = (page - 1) * pageSize;

        console.log('Received pagination parameters - page:', page, 'pageSize:', pageSize, 'offset:', offset);

        let apiUrl;

        if (search) {
            apiUrl = `https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`;
        } else if (type) {
            apiUrl = `https://pokeapi.co/api/v2/type/${type.toLowerCase()}`;
            const typeResponse = await fetch(apiUrl);
            if (!typeResponse.ok) {
                throw new Error(`Error ${typeResponse.status}: ${typeResponse.statusText}`);
            }
            const typeData = await typeResponse.json();
            const pokemonList = typeData.pokemon.map(pokemonEntry => ({
                name: pokemonEntry.pokemon.name,
                url: pokemonEntry.pokemon.url,
            }));
            return res.json(pokemonList);
        } else {
            apiUrl = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${pageSize}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Si es una búsqueda directa por nombre, devuelve un array con un solo objeto
        const pokemonList = search ? [data] : data.results.map(pokemon => ({
            name: pokemon.name,
            url: pokemon.url,
        }));

        res.json(pokemonList);
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});