exports.handler = async function (event, context){

  const { name = 'você' } = event.queryStringParameters;

  return {
    statusCode: 200,
    body:`Hello ${name}!`,
  };

}