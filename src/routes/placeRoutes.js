import {Router} from 'express';
import * as placeController from '../controllers/placeController.js';

const router = Router();

router.post('/', placeController.createPlace);
router.get('/:id', placeController.getPlace);
router.put('/:id', placeController.updatePlace);
router.delete('/:id', placeController.deletePlace);

//* Minule jsme se shodli že je optimálnější volat komentáře separátně od místa protože optimalizace a co kdyby jich byl milion or smt
router.get('/:id/comments', placeController.getComments); // Stejně by se to asi dalo udělat aby se volalo třeba top 50 or smt
router.post('/:id/comments', placeController.addComment);
router.delete('/comments/:commentId', placeController.deleteComment);
router.post('/:id/ratings', placeController.addRating);

export default router;