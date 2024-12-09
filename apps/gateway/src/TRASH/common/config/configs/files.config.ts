export class FilesConfig {
  readonly photosServiceHost: string;
  readonly photosServicePort: string;
}

export const filesConfig = (): FilesConfig => {
  const filesServiceHost = process.env.PHOTO_SERVICE_HOST;
  if (!filesServiceHost) throw new Error('PHOTO_SERVICE_HOST is not set');

  const filesServicePort = process.env.PHOTO_SERVICE_PORT;
  if (!filesServicePort) throw new Error('PHOTO_SERVICE_PORT is not set');
  return {
    photosServiceHost: filesServiceHost,
    photosServicePort: filesServicePort,
  };
};
