import { Router } from 'express';
import { listTeams, getTeamById, createTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', listTeams);
router.get('/:id', getTeamById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createTeam);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateTeam);
router.delete('/:id', authorizeRoles('ADMIN'), deleteTeam);

export default router;
