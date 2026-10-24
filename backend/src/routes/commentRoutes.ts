import { Router } from 'express';
import { addComment, deleteComment } from '../controllers/commentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/issue/:issueId', addComment);
router.delete('/:id', deleteComment);

export default router;
