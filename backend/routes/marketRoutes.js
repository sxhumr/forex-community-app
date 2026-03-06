import express from "express";
import { getMarketData } from "../controllers/marketController.js";

const router = express.Router();


router.get("/pair", getMarketData);

export default router;