export interface Photo {
  readonly id: string;
}

const PICSUM_SEED_URL = 'https://picsum.photos/seed';

export const DETAIL_SIZE = { width: 1600, height: 1200 } as const;
export const THUMBNAIL_SIZE = { width: 600, height: 600 } as const;

export function detailUrl(photo: Photo): string {
  return `${PICSUM_SEED_URL}/${encodeURIComponent(photo.id)}/${DETAIL_SIZE.width}/${DETAIL_SIZE.height}`;
}

export function thumbnailUrl(photo: Photo): string {
  return `${PICSUM_SEED_URL}/${encodeURIComponent(photo.id)}/${THUMBNAIL_SIZE.width}/${THUMBNAIL_SIZE.height}`;
}
