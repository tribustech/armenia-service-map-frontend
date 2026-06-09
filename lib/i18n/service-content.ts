import type { Service } from '@/types/api';

export function getLocalizedServiceContent(service: Service, locale: string) {
  const isArmenian = locale.toLowerCase().startsWith('hy');
  const pick = (primary?: string | null, secondary?: string | null) =>
    primary?.trim() ? primary : (secondary ?? '');

  if (isArmenian) {
    return {
      title: pick(service.titleHy, service.title),
      shortDescription: pick(service.shortDescriptionHy, service.shortDescription),
      description: pick(service.descriptionHy, service.description),
      howToAccess: pick(service.howToAccessHy, service.howToAccess),
    };
  }

  return {
    title: pick(service.title, service.titleHy),
    shortDescription: pick(service.shortDescription, service.shortDescriptionHy),
    description: pick(service.description, service.descriptionHy),
    howToAccess: pick(service.howToAccess, service.howToAccessHy),
  };
}
