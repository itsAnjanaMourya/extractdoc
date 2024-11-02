import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [extractedData, setExtractedData] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleExtractData = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const response = await axios.post('http://localhost:5000/api/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setExtractedData(response.data.extractedData);
        } catch (error) {
            console.error('Error extracting data:', error);
        }
    };

    return (
        <div>
            <h1>Document Data Extraction</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleExtractData}>Extract Data</button>

            {extractedData && (
                <div>
                    <h2>Extracted Information</h2>
                    <p><strong>Name:</strong> {extractedData.name}</p>
                    <p><strong>Document Number:</strong> {extractedData.documentNumber}</p>
                    <p><strong>Expiration Date:</strong> {extractedData.expirationDate}</p>
                </div>
            )}
        </div>
    );
}

export default App;
