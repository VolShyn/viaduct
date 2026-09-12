import { requestBlob } from './http/client';
import type {
  OpenApiBuildRequest,
  OpenApiDocumentResponse,
  OpenApiImportedEndpoint,
  RenderDiagramRequest,
  RenderSequenceRequest,
} from './types';
import { request } from './http/client';

export const renderApi = {
  renderDiagram: (payload: RenderDiagramRequest) =>
    requestBlob('/api/render/diagram', payload),
  renderSequence: (payload: RenderSequenceRequest) =>
    requestBlob('/api/render/sequence', payload),
};

export const openapiApi = {
  openapiBuild: (payload: OpenApiBuildRequest) =>
    request<{ doc: OpenApiDocumentResponse; resolved?: OpenApiDocumentResponse }>('/api/openapi/build', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  openapiParse: (payload: { json: string; stored?: string }) =>
    request<{
      doc: OpenApiDocumentResponse;
      resolved?: OpenApiDocumentResponse;
      endpoints: OpenApiImportedEndpoint[];
      refErrors?: string[];
    }>(
      '/api/openapi/parse',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  openapiExport: (payload: OpenApiBuildRequest) =>
    requestBlob('/api/openapi/export', payload),
};
