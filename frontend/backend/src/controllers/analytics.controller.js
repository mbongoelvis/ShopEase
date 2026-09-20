

import {
  getMonthlyRevenue,
  getInventoryTurnover,
  getEmployeeSecurityFlags,
} from '../models/analytics.model.js';

export async function revenue(req, res) {
  const months = req.query.months ? parseInt(req.query.months, 10) : 6;
  const data = await getMonthlyRevenue(req.user.storeId, months);
  res.json({ revenue: data });
}

export async function turnover(req, res) {
  const data = await getInventoryTurnover(req.user.storeId);
  res.json({ turnover: data });
}

export async function securityFlags(req, res) {
  const data = await getEmployeeSecurityFlags(req.user.storeId);
  res.json({ flags: data });
}