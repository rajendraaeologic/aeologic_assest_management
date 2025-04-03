import express from 'express';
import { basicController } from '@/controller';

const router = express.Router();

router.get('/countries', basicController.getCountries);

export default router;