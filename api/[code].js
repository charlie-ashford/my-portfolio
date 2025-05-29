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

  if (!code || !code.match(/^[a-zA-Z0-9]+$/)) {
    return res.status(400).send('Invalid code format');
  }

  try {
    const { blobs } = await list({ prefix: code, limit: 1 });

    if (blobs.length === 0) {
      return res.status(404).send('Image not found');
    }

    const blobToServe = blobs[0];

    const blobResponse = await fetch(blobToServe.url);

    if (!blobResponse.ok) {
      console.error(
        `Failed to fetch image from blob storage. URL: ${blobToServe.url}, Status: ${blobResponse.status}`
      );
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

    if (blobResponse.body) {
      blobResponse.body.pipe(res);
    } else {
      const buffer = await blobResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error(
      `Error serving image for code ${code} in /api/[code].js:`,
      error
    );
    return res.status(500).send('Internal server error when serving image.');
  }
};
