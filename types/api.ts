export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: { services: number };
}

export interface NeedTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count: { needReports: number };
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  svgPathId: string;
}

export interface Organisation {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  regionId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  region: Region | null;
  _count: { users: number; services: number };
}

export interface OrganisationDetail extends Organisation {
  users: UserSummary[];
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organisationId: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  organisation: { id: string; name: string } | null;
}

export interface ServiceTopic {
  topic: { id: string; name: string; slug: string };
}

export interface NeedReportTag {
  needTag: { id: string; name: string; slug: string };
}

export interface NeedReport {
  id: string;
  description: string;
  fullName: string;
  contactMethod: string;
  contactValue: string;
  regionId: string | null;
  status: 'NEW' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED';
  assignedOrganisationId: string | null;
  createdAt: string;
  updatedAt: string;
  region: { id: string; name: string } | null;
  assignedOrganisation: { id: string; name: string } | null;
  tags: NeedReportTag[];
}

export interface NeedsMapEntry {
  regionId: string;
  regionName: string;
  svgPathId: string;
  count: number;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  organisationId: string;
  regionId: string | null;
  isAvailable: boolean;
  availabilityStart: string | null;
  availabilityEnd: string | null;
  targetGroup: string[];
  createdAt: string;
  updatedAt: string;
  organisation: { id: string; name: string };
  region: { id: string; name: string } | null;
  topics: ServiceTopic[];
}
