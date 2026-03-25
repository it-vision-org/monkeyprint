const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { generateMockup, listTemplates } = require('./compositer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve template preview images
app.use('/templates', express.static(path.join(__dirname, '..', 'templates')));

/**
 * GET /api/templates
 * Returns list of available mockup templates
 */
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await listTemplates();
    res.json(templates);
  } catch (err) {
    console.error('Error listing templates:', err);
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

/**
 * POST /api/mockup
 *
 * Body (multipart/form-data):
 *   - template: string (template ID, e.g. "male_1")
 *   - shirtColor: string (hex color, e.g. "#FF0000")
 *   - design: file (PNG with transparency)
 *   - designX: number (X position of design on template)
 *   - designY: number (Y position of design on template)
 *   - designWidth: number (width to resize design to)
 *   - designHeight: number (height to resize design to)
 *
 * Returns: PNG image
 */
app.post('/api/mockup', upload.single('design'), async (req, res) => {
  try {
    const {
      template,
      shirtColor = '#FFFFFF',
      designX,
      designY,
      designWidth,
      designHeight,
    } = req.body;

    if (!template) {
      return res.status(400).json({ error: 'template is required' });
    }

    const options = {
      template,
      shirtColor,
      designBuffer: req.file ? req.file.buffer : null,
      designX: designX != null ? parseInt(designX, 10) : null,
      designY: designY != null ? parseInt(designY, 10) : null,
      designWidth: designWidth ? parseInt(designWidth, 10) : null,
      designHeight: designHeight ? parseInt(designHeight, 10) : null,
    };

    const resultBuffer = await generateMockup(options);

    res.set('Content-Type', 'image/png');
    res.send(resultBuffer);
  } catch (err) {
    console.error('Error generating mockup:', err);
    res.status(500).json({ error: 'Failed to generate mockup', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`T-Shirt Mockup API running at http://localhost:${PORT}`);
  console.log(`Demo app: http://localhost:${PORT}/`);
});
