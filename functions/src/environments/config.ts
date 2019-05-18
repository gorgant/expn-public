import * as functions from 'firebase-functions';
import { EnvironmentTypes, PRODUCTION_APPS, SANDBOX_APPS } from '../../../shared-models/environments/env-vars.model';

export const currentEnvironmentType = functions.config().environment.type;

const getAdminProjectName = (): string => {
  let projectName: string;

  switch (currentEnvironmentType) {
    case EnvironmentTypes.PRODUCTION:
      projectName = PRODUCTION_APPS.adminApp.projectId
      break;
    case EnvironmentTypes.SANDBOX:
      projectName = SANDBOX_APPS.adminApp.projectId
      break;
    default:
      projectName = SANDBOX_APPS.adminApp.projectId
      break;
  }
  return projectName;
}

export const adminProjectName = getAdminProjectName();