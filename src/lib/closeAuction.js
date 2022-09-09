import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
export async function closeAuction(auction) {
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auction.id },
        UpdateExpression: 'set #status = :status',
        // status is reserved word that's why we use #status
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':status': 'CLOSED'
        },
    }
    await dynamoDB.update(params).promise();
    const { title, seller, highestBid } = auction;
    const { amount, bidder } = highestBid;

    if (amount === 0) {
        await sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: 'No bids on your item!',
                recipient: seller,
                body: `Sorry! No bids on your item ${title}. Better luck next time`,
            }),
        }).promise();
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'Your item has been solved',
            recipient: seller,
            body: `Your item ${title} has been sold for $${amount}!`,
        }),
    }).promise();

    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'You won an auction!',
            recipient: bidder,
            body: `Great Deal! You got ${title} for $${amount}!`,
        }),
    }).promise();

    return Promise.all([notifySeller, notifyBidder])
}