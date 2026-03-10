const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY',
    region: 'us-east-1' // replace with your region
});

const BUCKET_NAME = 'satguru-invoices';

const uploadFile = (filePath, keyName) => {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: BUCKET_NAME,
        Key: keyName,
        Body: fileContent
    };

    return s3.upload(params).promise();
};

module.exports = { uploadFile };
