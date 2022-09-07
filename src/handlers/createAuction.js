import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';

import commonMiddleware from '../lib/commonMiddleware';

// used to create http error in very declarative way 
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();


async function createAuction(event, context) {
  // event -> will have all the information about event or execution stuff like
  // the event body, query params, path params, headers etc.

  // context -> will contains some meta data about execution of this lambda function.

  // you can also add custom data both to your events and context via middleware.
  // ex. if lambda require a id of user then you can create a middleware that put the
  // user ID in context.

  // lambdas can only run up to 15 minutes. 

  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);
  // id is partition key in DynamoDB's AuctionsTable
  // so it must be unique
  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  try {
    // by default dynamodb.put returns callback
    // that's why we have used .promise() and await
    // it is applicable to all dynamodb, S3 bucket or other services 
    await dynamoDB.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    }).promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  // if you called lambda function by https then it expect, below like response.
  // it is neccsary to return string in body.
  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

// middy is used to add middleware to our lambda function 
export const handler = commonMiddleware(createAuction);
// you can still add middy middlware by adding .use(middlware)


// sls deploy -f getAuctions -v