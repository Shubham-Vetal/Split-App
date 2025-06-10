import express from 'express';
import {
  getPeople,
  getBalances,
  getSettlements,
} from '../controllers/settlement.controller.js';

const router = express.Router();

router.get('/people', getPeople);
router.get('/balances', getBalances);
router.get('/settlements', getSettlements);

export default router;
