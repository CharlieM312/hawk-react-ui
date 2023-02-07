export default async function FetchResults(hawkClient, queryId) {
  let result;

  try {
    result = await hawkClient.fetchAsyncQueryResults(queryId);
  } catch (err) {
    throw(err);
  }

  let formattedResult;
  Object.keys(result['result']).forEach(function(key, index) {
    if (result['result'][key]) {
      formattedResult = result['result'][key];
    }
  });

  return {
    'formattedResult': formattedResult ?? '',
    'raw': JSON.stringify(result, undefined, 2)
  };
}
