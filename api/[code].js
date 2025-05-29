const { list } = require('@vercel/blob');

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
    const { blobs } = await list({ prefix: code });

    if (blobs.length === 0) {
      return res.status(404).send('Image not found');
    }

    const blob = blobs[0];

    return res.redirect(blob.url);
  } catch (error) {
    console.error('Error serving image:', error);
    return res.status(500).send('Server error');
  }
};
