import { Router } from 'express';
import {
  listIssues,
  getIssueByIdOrKey,
  createIssue,
  updateIssue,
  assignIssue,
  updateStatus,
  deleteIssue,
} from '../controllers/issueController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', listIssues);
router.get('/:id', getIssueByIdOrKey);
router.post('/', createIssue);
router.put('/:id', updateIssue);
router.patch('/:id/assign', assignIssue);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteIssue);

export default router;
