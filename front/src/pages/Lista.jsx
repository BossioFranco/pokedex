import React, { useState } from "react";
import Grid from '@mui/material/Grid';
import { Button, Typography, } from "@mui/material";
import logo from './../assets/logo.png'
import useSWR, { mutate } from 'swr';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
const Lista = ({ }) => {

    const [page, setPage] = useState(1); // Estado para rastrear la página actual
    const [buscar, setBuscar] = useState('')
    const [tipoBuscar, setTipoBuscar] = useState('');

    const [list, setList] = useState('')
    const [charging, setChargin] = useState(false)
    const handleKeyDown = (event) => {
        // Verificar si la tecla presionada es Enter (código 13)
        if (event.key === 'Enter') {
            // Llamar a la función que maneja la búsqueda
            buscador();
        }
    };

    const handleTipoKeyDown = (event) => {
        if (event.key === 'Enter') {
            buscadorTipo();
        }
    };

    const buscador = async () => {
        try {
            // Construir la URL para la búsqueda
            const searchUrl = `http://localhost:3001/pokemon?page=1&search=${buscar}`;

            // Hacer la búsqueda y obtener los datos actualizados
            const searchData = await fetch(searchUrl).then(response => response.json());

            // Actualizar la lista de Pokémon con los nuevos resultados
            console.log('distinta', searchData)
            setList(searchData); // Asegúrate de extraer la propiedad 'results' si existe
        } catch (error) {
            console.error('Error en la búsqueda:', error.message);
        }
    };

    const buscadorTipo = async () => {
        try {
            // Construir la URL para la búsqueda por tipo
            const tipoUrl = `http://localhost:3001/pokemon?page=1&tipo=${tipoBuscar}`;

            // Hacer la búsqueda y obtener los datos actualizados
            const tipoData = await fetch(tipoUrl).then(response => response.json());

            // Actualizar la lista de Pokémon con los nuevos resultados
            setList(tipoData);
        } catch (error) {
            console.error('Error en la búsqueda por tipo:', error.message);
        }
    };

    const { data: pokemonList, error, } = useSWR(`http://localhost:3001/pokemon?page=${page}`, async (url) => {
        setChargin(true);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        const detailedPokemonList = await Promise.all(
            data.map(async (pokemon) => {
                const detailsResponse = await fetch(pokemon.url);

                if (!detailsResponse.ok) {
                    throw new Error(`Error ${detailsResponse.status}: ${detailsResponse.statusText}`);
                }

                const detailsData = await detailsResponse.json();
                return {
                    name: detailsData.name,
                    types: detailsData.types,
                    stats: detailsData.stats,
                    weight: detailsData.weight,
                    height: detailsData.height,
                    abilities: detailsData.abilities
                };
            })
        );

        setList(detailedPokemonList);
        console.log(detailedPokemonList)

        setChargin(false);
    }, { revalidateOnFocus: false });


    if (error) {
        console.error('Error:', error.message);
    }

    if (error) {
        console.error('Error:', error.message);
    }
    return (
        <Grid bgcolor={'#91DCE6'} height={'100%'}>
            <Grid container justifyContent={'center'}>
                <img src={logo} alt="logo" height={200} />
            </Grid>


            <Grid container justifyContent={'center'} mb={2}>
                <FormControl
                    sx={{ m: 1, width: '80vw', bgcolor: 'white' }}
                    value={buscar}
                    onChange={(event) => setBuscar(event.target.value)}
                    onKeyDown={handleKeyDown}
                >
                    <InputLabel>Name</InputLabel>
                    <OutlinedInput
                        type={'text'}
                        label="Name"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton sx={{ p: '10px' }} aria-label="search" onClick={buscador}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                <FormControl
                    sx={{ m: 1, width: '80vw', bgcolor: 'white' }}
                    value={tipoBuscar}
                    onChange={(event) => setTipoBuscar(event.target.value)}
                    onKeyDown={handleTipoKeyDown}
                >
                    <InputLabel>Type</InputLabel>
                    <OutlinedInput
                        type={'text'}
                        label="Tipo"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton sx={{ p: '10px' }} aria-label="search" onClick={buscadorTipo}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>

            </Grid>

            <Grid p={15}>
                {!charging ?

                    list &&
                    list.map((row, index) => {
                        return (
                            <Accordion key={index} sx={{ bgcolor: '#F0FDFF' }}>

                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header">

                                    <Grid container direction={'column'} pl={5}>
                                        <Typography><strong style={{ fontSize: 18 }}>Name:</strong> {row.name}</Typography>
                                        <Typography><strong style={{ fontSize: 18 }}>Types:</strong> {row.types.map(type => type.type.name).join(' / ')}</Typography>
                                        <Typography><strong style={{ fontSize: 18 }}>Stats:</strong></Typography>
                                        <ul style={{ marginTop: -0.5 }}>
                                            {row.stats.map((row, index) => (
                                                <li key={index}>
                                                    {row.stat.name + ' : ' + row.base_stat}
                                                </li>
                                            ))}
                                        </ul>
                                    </Grid>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container direction={'column'} pl={5}>
                                        <Typography><strong style={{ fontSize: 18 }}>Weight:</strong> {row.weight}</Typography>
                                        <Typography><strong style={{ fontSize: 18 }}>Height: </strong>{row.height}</Typography>
                                        <Typography><strong style={{ fontSize: 18 }}>Abilities:</strong></Typography>
                                        <ul style={{ marginTop: -0.5 }}>
                                            {row.abilities.map((ability, abilityIndex) => (
                                                <li key={abilityIndex}>
                                                    {ability.ability.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })
                    :
                    <Grid container pl={5}>
                        <Typography>Cargando...</Typography>
                    </Grid>
                }

                <Grid container pb={55} mt={2} justifyContent={'flex-end'} >
                    <IconButton sx={{ width: 55, height: 25, color:'black' }} variant="contained" onClick={() => setPage(page - 1)} disabled={page === 1}>
                        <ArrowLeftIcon />
                    </IconButton>
                    <span>Página {page}</span>
                    <IconButton sx={{ width: 55, height: 25, color:'black' }} variant="contained" onClick={() => setPage(page + 1)}>
                        <ArrowRightIcon sx={{ fontSize: 25 }} />
                    </IconButton>
                </Grid>
            </Grid>

        </Grid>)
}

export default Lista