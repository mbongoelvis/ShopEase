

import { listAllTenants, getTenantDetail as _getTenantDetail, getPlatformAnalytics as _getPlatformAnalytics } from '../models/tenant.model.js';

export async function getTenants(req, res) {
  const tenants = await listAllTenants();
  res.json({ tenants });
}

export async function getTenantDetail(req, res) {
  const tenant = await _getTenantDetail(req.params.storeId);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }
  res.json({ tenant });
}

export async function getPlatformAnalytics(req, res) {
  const analytics = await _getPlatformAnalytics();
  res.json({ analytics });
}