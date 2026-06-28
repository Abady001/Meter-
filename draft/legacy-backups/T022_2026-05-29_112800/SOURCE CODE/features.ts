import type { NextApiRequest, NextApiResponse } from 'next';
import { FeatureFlags } from '@/lib/feature-flags';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const source =
    process.env.NODE_ENV === 'development' ? 'local-storage' : 'config';

  res.status(200).json({
    source,
    flags: FeatureFlags,
  });
}
