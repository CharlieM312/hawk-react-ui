export default function Query(queryText, instance) {
  let transport = new Thrift.Transport(
    'http://localhost:8080/thrift/hawk/json',
  );
  let protocol = new Thrift.Protocol(transport);
  let client = new HawkClient(protocol);

  let instanceName  = instance;
  let query         = queryText;
  let queryLanguage = 'org.eclipse.hawk.epsilon.emc.EOLQueryEngine';
  let qOptions      = new HawkQueryOptions();

  let result;
  try {
    result = client.timedQuery(instanceName, query, queryLanguage, qOptions);
  } catch (err) {
    console.log(err);
  }

  return JSON.stringify(result, undefined, 2);
}
