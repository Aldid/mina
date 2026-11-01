import { createSkinAnalysisHandlers } from '../../../lib/skinAnalysisRoute';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const handlers = createSkinAnalysisHandlers(() => process.env.PERFECT_CORP_ENABLED === 'true' ? process.env.PERFECT_CORP_API_KEY : undefined);
export const GET = handlers.GET;
export const POST = handlers.POST;
