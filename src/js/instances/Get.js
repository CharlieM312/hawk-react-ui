export default function Get() {
  let transport = new Thrift.Transport(
    'http://localhost:8080/thrift/hawk/json',
  );
  let protocol = new Thrift.Protocol(transport);
  let client = new HawkClient(protocol);

  let result = [];
  try {
    result = client.listInstances();
  } catch (err) {
    console.log(err);
  }
  
  return {
    name: result[0].name,
    state: result[0].state,
    message: result[0].message
  };
}
