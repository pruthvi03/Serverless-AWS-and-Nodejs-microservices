import AWS from 'aws-sdk';

import commonMiddleware from '../lib/commonMiddleware';

// used to create http error in very declarative way 
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();


async function getAuctions(event, context) {
    // event -> will have all the information about event or execution stuff like
    // the event body, query params, path params, headers etc.

    // context -> will contains some meta data about execution of this lambda function.

    // you can also add custom data both to your events and context via middleware.
    // ex. if lambda require a id of user then you can create a middleware that put the
    // user ID in context.

    // lambdas can only run up to 15 minutes. 

    const { status } = event.queryStringParameters;

    let auctions;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':status': status
        }
    }

    try {
        // // currently, we are using scan operation, 
        // // which should be avoidable in most cases
        // const result = await dynamoDB.scan({
        //     TableName: process.env.AUCTIONS_TABLE_NAME
        // }).promise();

        const result = await dynamoDB.query(params).promise();

        auctions = result.Items;

    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    // if you called lambda function by https then it expect, below like response.
    // it is neccsary to return string in body.
    return {
        statusCode: 200,
        body: JSON.stringify(auctions),
    };
}

// middy is used to add middleware to our lambda function 
export const handler = commonMiddleware(getAuctions)


