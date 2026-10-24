import { Router } from 'express';
import { uploadAttachment, deleteAttachment } from '../controllers/attachmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/issue/:issueId', upload.single('file'), uploadAttachment);
router.delete('/:id', deleteAttachment);

export default router;
