import router from './auth.routes.js';
import { configurePassport } from './strategies/passport.js';

configurePassport();

export default router;
