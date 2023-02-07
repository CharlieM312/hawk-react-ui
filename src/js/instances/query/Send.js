export default function Send(hawkClient, query, instance, queryLanguage) {
  let qOptions = new HawkQueryOptions();

  let queryId;
  try {
    queryId = hawkClient.asyncQuery(instance, query, queryLanguage, qOptions);
  } catch (err) {
    throw(err);
  }

  return queryId;
}
