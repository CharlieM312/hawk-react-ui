export default async function FetchResults(hawkClient, queryId) {
  try {
    const result = await hawkClient.fetchAsyncQueryResults(queryId);
    let formattedResult;
    Object.keys(result['result']).forEach(function(key, index) {
      if (result['result'][key]) {
        formattedResult = result['result'][key];
      }
    });

    return {
      'isGraph': typeof formattedResult === 'object' ? true : false,
      'result': result,
      'formattedResult': formattedResult ?? '',
      'raw': JSON.stringify(result, undefined, 2),
      'modelElement': typeof formattedResult === 'object' ? formattedResult[0].vModelElement : null,
      'queryTime': result.wallMillis
    };
  } catch (err) {
    throw(err);
  }
}
