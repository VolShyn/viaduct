import { authApi, supportApi } from './auth.api';
import { dataFlowsApi, domainsApi } from './data-flows.api';
import { docsApi } from './docs.api';
import { renderApi, openapiApi } from './render.api';

export * from './types';
export { hasGitlabIdentity, isGuestUser, loginPagePath, onUnauthorized } from './auth.api';

/** Community facade — local editor only; cloud APIs removed. */
export const api = {
  ...authApi,
  ...supportApi,
  ...renderApi,
  ...openapiApi,
  ...docsApi,
  ...dataFlowsApi,
  ...domainsApi,
};

export {
  authApi,
  supportApi,
  docsApi,
  dataFlowsApi,
  domainsApi,
  renderApi,
  openapiApi,
};

export { designReadApi, figmaApi } from './figma.api';
