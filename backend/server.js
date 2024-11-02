const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const poppler = require('pdf-poppler');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5000;
app.use(cors({ credentials: true, origin:"http://localhost:3000"}))

const upload = multer({ dest: 'uploads/' });
async function convertPdfToImage(pdfPath) {
    const outputPrefix = path.join(__dirname, 'uploads', 'outputimage');
    const options = {
        format: 'png',
        out_dir: path.dirname(outputPrefix),
        out_prefix: path.basename(outputPrefix),
        page: 1 
    };

    await poppler.convert(pdfPath, options);
    return `${outputPrefix}-1.png`;
}
app.post('/api/extract', upload.single('document'), async (req, res) => {
    try {
        const { path: filePath, mimetype } = req.file;
        let imagePath = filePath;

        if (mimetype === 'application/pdf') {
            imagePath = await convertPdfToImage(filePath);
        }

        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');

        fs.unlinkSync(filePath);
        if (imagePath !== filePath) fs.unlinkSync(imagePath);

        const namePattern = /Name:\s*(\w+\s+\w+)/i;
        const documentNumberPattern = /Document Number:\s*([A-Z0-9]+)/i;
        const expirationPattern = /Expiration Date:\s*(\d{2}\/\d{2}\/\d{4})/i;

        const nameMatch = text.match(namePattern);
        const docNumberMatch = text.match(documentNumberPattern);
        const expirationMatch = text.match(expirationPattern);

        const extractedData = {
            name: nameMatch ? nameMatch[1] : null,
            documentNumber: docNumberMatch ? docNumberMatch[1] : null,
            expirationDate: expirationMatch ? expirationMatch[1] : null,
        };
        console.log("data here: ",extractedData)
        res.json({ extractedData });
    } catch (error) {
        console.error('Error during OCR processing:', error);
        res.status(500).json({ error: 'Failed to extract document data' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
