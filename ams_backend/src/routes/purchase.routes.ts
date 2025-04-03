import express from 'express';
import auth from '@/middleware/auth.middleware';
import validate from '@/middleware/validation.middleware';

const router = express.Router();

// router
//     .route('/')
//     .get(auth('getPurchases'), validate(purchaseValidation.getPurchases), purchaseController.getPurchases)

export default router;