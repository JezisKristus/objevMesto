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

export const createCity = async (req, res) => {
    try {
        const id = await cityService.createCity(req.body);
        res.status(201).json({ message: 'City created', id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create city' });
    }
};

export const updateCity = async (req, res) => {
    try {
        await cityService.updateCity(req.params.id, req.body);
        res.json({ message: 'City updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update city' });
    }
};

export const deleteCity = async (req, res) => {
    try {
        await cityService.deleteCity(req.params.id);
        res.json({ message: 'City deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete city' });
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