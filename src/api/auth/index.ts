import router from './auth.routes';
import { configurePassport } from './strategies/passport';

configurePassport();

export default router;
