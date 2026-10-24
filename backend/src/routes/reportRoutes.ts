import { Router } from 'express';
import { getDashboardStats, getAnalyticsReport, exportIssuesCsv } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalyticsReport);
router.get('/export/csv', exportIssuesCsv);

export default router;
