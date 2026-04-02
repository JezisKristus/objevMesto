import * as cityService from '../services/cityService.js';
import * as placeService from '../services/placeService.js';

export const getCities = async (req, res) => {
    try {
        const cities = await cityService.getAllCities();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
};

export const getCityPlaces = async (req, res) => {
    try {
        const places = await placeService.getPlacesByCity(req.params.id);
        res.json(places);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch places' });
    }
};