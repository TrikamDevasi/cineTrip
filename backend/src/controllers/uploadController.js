const crypto = require('crypto');

/**
 * Signed Cloudinary Upload Support
 *
 * The frontend performs unsigned uploads using a public upload preset. That
 * preset must exist and be configured for unsigned use on the account, which a
 * production deployment cannot assume. To make uploads robust and keep the
 * Cloudinary API secret out of the client bundle, the signature is generated
 * here on the backend (which holds CLOUDINARY_API_SECRET) and handed to the
 * client. Signed uploads do not require an unsigned preset.
 *
 * Security: CLOUDINARY_API_SECRET is never returned to the client — only the
 * ephemeral signature, timestamp, and the publishable api_key/cloud name.
 */

const VALID_RESOURCE_TYPES = ['image', 'video'];

// POST /api/upload/sign
const signUpload = (req, res, next) => {
  try {
    const resourceType = req.body?.resourceType || 'image';
    if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
      return res.status(400).json({ message: `Unsupported resource type. Use one of: ${VALID_RESOURCE_TYPES.join(', ')}` });
    }

    const secret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!secret || !apiKey || !cloudName) {
      return res.status(503).json({ message: 'Cloud media upload is not configured on the server. Use local storage.' });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'cinetrip';

    // Cloudinary signs all submitted unsigned params in alphabetical order.
    // params: folder, timestamp
    const stringToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(`${stringToSign}${secret}`).digest('hex');

    res.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      resourceType,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signUpload };