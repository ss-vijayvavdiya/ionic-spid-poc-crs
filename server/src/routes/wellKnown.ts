/**
 * Serves /.well-known/assetlinks.json for Android App Links.
 * Android uses this file to verify that the domain is associated with our app
 * (package name + SHA256 of the app's signing certificate).
 * Generated at runtime so it always uses the current ANDROID_SHA256_FINGERPRINT from env.
 */
import { Router } from 'express';
import { config } from '../config';

const router = Router();

router.get('/assetlinks.json', (_req, res) => {
  const fingerprint = config.ANDROID_SHA256_FINGERPRINT.replace(/:/g, '');
  const assetlinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: config.ANDROID_PACKAGE_NAME,
        sha256_cert_fingerprints: [fingerprint],
      },
    },
  ];
  res.setHeader('Content-Type', 'application/json');
  res.json(assetlinks);
});

export { router as wellKnownRouter };
