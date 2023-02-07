export default function Cancel(hawkClient, queryId) {
  try {
    hawkClient.cancelAsyncQuery(queryId);
    console.log('cancelled');
  } catch (err) {
    throw(err);
  }
}
