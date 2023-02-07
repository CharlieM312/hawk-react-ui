export default function Create(url) {
  try {
    const transport = new Thrift.Transport(url);
    const protocol  = new Thrift.Protocol(transport);

    return new HawkClient(protocol);
  } catch (err) {
    throw(err);
  }
}
