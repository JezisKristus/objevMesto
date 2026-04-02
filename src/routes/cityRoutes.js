import { Router } from 'express';
import * as cityController from '../controllers/cityController.js';

const router = Router();

router.get('/', cityController.getCities);
router.get('/:id/places', cityController.getCityPlaces);

export default router;