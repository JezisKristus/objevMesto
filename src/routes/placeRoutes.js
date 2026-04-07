import { Router } from 'express';
import * as placeController from '../controllers/placeController.js';

const router = Router();

router.post('/', placeController.createPlace);
router.get('/:id', placeController.getPlace);
router.put('/:id', placeController.updatePlace);
router.delete('/:id', placeController.deletePlace);

//* Komentáře a ratingy získávám když získám místo, nemám na ně individuální volání, asi by to chtělo I guess, prej se to hodí když mám hodně komentářů nebo hodnocení, optimalizace
router.post('/:id/comments', placeController.addComment);
router.delete('/comments/:commentId', placeController.deleteComment);
router.post('/:id/ratings', placeController.addRating);

export default router;