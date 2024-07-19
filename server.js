const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Google Drive API setup
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});

// Endpoint to save file
app.post('/save', async (req, res) => {
    try {
        const { filename, content } = req.body;
        const fileMetadata = {
            name: filename,
            mimeType: 'text/plain'
        };
        const media = {
            mimeType: 'text/plain',
            body: content
        };
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
        });
        res.status(200).json({ fileId: response.data.id });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Endpoint to retrieve file
app.get('/retrieve/:id', async (req, res) => {
    try {
        const fileId = req.params.id;
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'stream' });
        response.data
            .on('end', () => {
                res.end();
            })
            .on('error', (err) => {
                res.status(500).send(err.toString());
            })
            .pipe(res);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
