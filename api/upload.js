const multer = require('multer');
const crypto = require('crypto');
const { put } = require('@vercel/blob');

function generateCode(length = 8) {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const randomBytes = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }

  return result;
}

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and GIF are allowed.'));
    }
  },
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('image'));

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded.',
      });
    }

    const code = generateCode(8);

    let ext;
    switch (req.file.mimetype) {
      case 'image/jpeg':
        ext = '.jpg';
        break;
      case 'image/png':
        ext = '.png';
        break;
      case 'image/gif':
        ext = '.gif';
        break;
      default:
        ext = '.jpg';
    }

    const blob = await put(`${code}${ext}`, req.file.buffer, {
      access: 'public',
    });

    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${host}/${code}`;

    return res.status(200).json({
      success: true,
      url,
      code: code,
      size: req.file.size,
      mimetype: req.file.mimetype,
      blobUrl: blob.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
