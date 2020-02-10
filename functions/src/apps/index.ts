import * as admin from 'firebase-admin';
import { currentEnvironmentType } from '../environments/config';
import { EnvironmentTypes, PRODUCTION_APPS, SANDBOX_APPS } from '../../../shared-models/environments/env-vars.model';

// Local app intialization will automatically select sandbox or production based on which environment initialized it
export const publicApp = admin.initializeApp();

// Access to public app requires admin service account to be added to public IAM
export const getExplearningAdminApp = () => {
  let app: admin.app.App;

  switch (currentEnvironmentType) {
    case EnvironmentTypes.PRODUCTION:
      app = admin.initializeApp(
        PRODUCTION_APPS.explearningAdminApp,
        'explearningAdminApp'
      );
      break;
    case EnvironmentTypes.SANDBOX:
      app = admin.initializeApp(
        SANDBOX_APPS.explearningAdminApp,
        'explearningAdminApp'
      );
      break;
    default:
      app = admin.initializeApp(
        SANDBOX_APPS.explearningAdminApp,
        'explearningAdminApp'
      );
      break;
  }
  return app;
};