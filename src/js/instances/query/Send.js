export default function Send(hawkClient, query, instance, queryLanguage) {
  let qOptions = new HawkQueryOptions({includeContained: false});

  try {
    const queryId = hawkClient.asyncQuery(instance, query, queryLanguage, qOptions);
    return queryId;
  } catch (err) {
    throw(err);
  }
}
