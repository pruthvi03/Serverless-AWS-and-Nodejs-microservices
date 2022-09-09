async function notifyAuctionStarted(event, context) {
  const record = event.Records[0];
  console.log('record prrocessing: ', record);

  const body = JSON.parse(record.body)
  console.log(body);
  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
}

export const handler = notifyAuctionEnded;


