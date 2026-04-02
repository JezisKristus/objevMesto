import * as placeService from '../services/placeService.js';

export const getPlace = async (req, res) => {
    try {
        const place = await placeService.getPlaceDetails(req.params.id);
        if (!place) return res.status(404).json({ error: 'Place not found' });
        res.json(place);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch place details' });
    }
};

export const createPlace = async (req, res) => {
    try {
        const id = await placeService.createPlace(req.body);
        res.status(201).json({ message: 'Place created', id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create place' });
    }
};

export const updatePlace = async (req, res) => {
    try {
        await placeService.updatePlace(req.params.id, req.body);
        res.json({ message: 'Place updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update place' });
    }
};

export const deletePlace = async (req, res) => {
    try {
        await placeService.deletePlace(req.params.id);
        res.json({ message: 'Place deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete place' });
    }
};

export const addComment = async (req, res) => {
    try {
        const { author_name, text } = req.body;
        const id = await placeService.addComment(req.params.id, author_name, text);
        res.status(201).json({ message: 'Comment added', id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

export const deleteComment = async (req, res) => {
    try {
        await placeService.deleteComment(req.params.commentId);
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

export const addRating = async (req, res) => {
    try {
        const { stars } = req.body;
        const id = await placeService.addRating(req.params.id, stars);
        res.status(201).json({ message: 'Rating added', id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add rating' });
    }
};