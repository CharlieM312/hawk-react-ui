export default function Get(hawkClient) {
  let result = [];
  try {
    result = hawkClient.listInstances();
  } catch (err) {
    console.log(err);
    throw(err);
  }

  let formattedInstances = [];

  result.forEach(function(instance) {
    formattedInstances.push(
      {
        name: instance.name,
        state: instance.state,
        message: instance.message
      }
    );
  });

  return formattedInstances;
}
