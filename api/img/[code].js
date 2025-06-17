const { list } = require('@vercel/blob');
const path = require('path');

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
};

module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code || !/^[a-zA-Z0-9]{8}$/.test(code)) {
    return res.status(404).send('Not found');
  }

  try {
    const { blobs } = await list({ prefix: code, limit: 1 });

    if (blobs.length === 0) {
      return res.status(404).send('Image not found');
    }

    const blobToServe = blobs[0];
    const blobResponse = await fetch(blobToServe.url);

    if (!blobResponse.ok) {
      return res.status(500).send('Error retrieving image from storage.');
    }

    let contentType = blobToServe.contentType;
    if (!contentType || contentType === 'application/octet-stream') {
      const ext = path.extname(blobToServe.pathname).toLowerCase();
      contentType = mimeTypes[ext] || 'application/octet-stream';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${blobToServe.pathname}"`
    );
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const arrayBuffer = await blobResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    return res.status(500).send('Internal server error.');
  }
};