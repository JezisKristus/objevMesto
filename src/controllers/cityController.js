import * as cityService from '../services/cityService.js';
import * as placeService from '../services/placeService.js';

export const getCities = async (req, res) => {
    try {
        const cities = await cityService.getAllCities();
        res.json(cities);
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch cities'});
    }
};

export const createCity = async (req, res) => {
    try {
        const id = await cityService.createCity(req.body);
        res.status(201).json({message: 'Place created', id});
    } catch (error) {
        res.status(500).json({error: 'Failed to create place'});
    }
};

export const getCityPlaces = async (req, res) => {
    try {
        const places = await placeService.getPlacesByCity(req.params.id);
        res.json(places);
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch places'});
    }
};