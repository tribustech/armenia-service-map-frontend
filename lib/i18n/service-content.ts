import type { Service } from '@/types/api';

export function getLocalizedServiceContent(service: Service, locale: string) {
  const isArmenian = locale.toLowerCase().startsWith('hy');
  if (!isArmenian) {
    return {
      title: service.title,
      shortDescription: service.shortDescription,
      description: service.description,
    };
  }

  return {
    title: service.titleHy?.trim() ? service.titleHy : service.title,
    shortDescription: service.shortDescriptionHy?.trim()
      ? service.shortDescriptionHy
      : service.shortDescription,
    description: service.descriptionHy?.trim() ? service.descriptionHy : service.description,
  };
}
