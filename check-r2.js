const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const client = new S3Client({
    region: 'auto',
    endpoint: 'https://f6d8fa8b9a9c6abca80b81a31d8c711c.eu.r2.cloudflarestorage.com',
    credentials: {
        accessKeyId: '27623da20c7686a51c7823e2e85fb059',
        secretAccessKey: '836fffdd0f273acc8b7a25b8d93b34f32b519ebafa02c4e58ab2d3e1e1f15bc6',
    }
});

async function main() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: 'rad',
        });
        const response = await client.send(command);
        console.log("Buckets:", response.Buckets.map(b => b.Name));
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
