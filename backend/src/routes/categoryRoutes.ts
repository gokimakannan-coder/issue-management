import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', listCategories);
router.post('/', authorizeRoles('ADMIN'), createCategory);
router.put('/:id', authorizeRoles('ADMIN'), updateCategory);
router.delete('/:id', authorizeRoles('ADMIN'), deleteCategory);

export default router;
