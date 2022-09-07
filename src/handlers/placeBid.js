import AWS from 'aws-sdk';

import commonMiddleware from '../lib/commonMiddleware';

// used to create http error in very declarative way 
import createError from 'http-errors';
import { getAuctionById } from './getAuction';

const dynamoDB = new AWS.DynamoDB.DocumentClient();


async function placeBid(event, context) {
    // event -> will have all the information about event or execution stuff like
    // the event body, query params, path params, headers etc.

    // context -> will contains some meta data about execution of this lambda function.

    // you can also add custom data both to your events and context via middleware.
    // ex. if lambda require a id of user then you can create a middleware that put the
    // user ID in context.

    // lambdas can only run up to 15 minutes. 

    const { id } = event.pathParameters;
    const { amount } = event.body;

    const auction = await getAuctionById(id);

    if (amount <= auction.highestBid.amount) {
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`)
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount,
        },
        ReturnValues: 'All_NEW',
    };

    let updatedAuction;

    try {

        const result = await dynamoDB.update(params).promise();;
        updatedAuction = result.Attributes;

    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    // if you called lambda function by https then it expect, below like response.
    // it is neccsary to return string in body.
    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
}

// middy is used to add middleware to our lambda function 
export const handler = commonMiddleware(placeBid)

