type OrgNameSource = {
  organisation?: { id: string; name: string } | null;
  externalOrganisationName?: string | null;
};

export function serviceOrgName(service: OrgNameSource): string {
  return service.organisation?.name ?? service.externalOrganisationName ?? '';
}
