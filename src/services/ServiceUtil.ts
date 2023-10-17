import ApiUrls from "../constants/ApiUrls";

export function ensureResponseReady(response: Response) {
  if (!response.ok) {
    throw new Error(
      `An error has occured: ${response.status} ${response.body}`
    );
  }
}

export function formatUrl(path: string): string {
  return `${ApiUrls.apiHost}${path}`;
}

export function formatCoreUrl(path: string): string {
  return formatUrl(`/api${path}`);
}

export function formatWorkflowUrl(path: string) {
  return formatUrl(`/workflow${path}`);
}

export function formatMeetupApiUrl(path: string) {
  return formatCoreUrl(`/meetup${path}`);
}

export function formatFileUrl(path: string) {
  return `${ApiUrls.fileHost}/${path}`;
}
