const AWS = require('aws-sdk');

// Configure AWS (use root credentials for now)
AWS.config.update({
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY',
    region: 'us-east-1' // replace with your region
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoDB;
