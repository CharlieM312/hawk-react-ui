export default function Cancel(hawkClient, queryId) {
  try {
    hawkClient.cancelAsyncQuery(queryId);
  } catch (err) {
    throw(err);
  }
}
