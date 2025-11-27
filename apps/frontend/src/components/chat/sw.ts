export async function registerServiceWorker(swPath: string) {
  const existingRegistration = await navigator.serviceWorker.getRegistration();
  if (existingRegistration) {
    const scriptURL = existingRegistration.active?.scriptURL;

    // Version mismatch, unregister old one
    if (!scriptURL?.endsWith(swPath)) {
      console.debug(
        '[sw:ESBuild] Unregistering old service worker',
        scriptURL,
        swPath
      );
      await existingRegistration.unregister();
    }
  }

  // Register new service worker
  console.debug('[sw:ESBuild] Registering new service worker', swPath);
  await navigator.serviceWorker
    .register(swPath, { type: 'module', scope: '/' })
    .then((registration) => {
      console.debug(
        '[sw:ESBuild] Service worker registered within scope: ',
        registration
      );
    })
    .catch((error) => {
      console.error('[sw:ESBuild] Error registering service worker: ', error);
    });
}
