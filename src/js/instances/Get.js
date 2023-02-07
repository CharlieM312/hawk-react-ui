export default function Get(hawkClient) {
  let result = [];
  try {
    result = hawkClient.listInstances();
  } catch (err) {
    console.log(err);
    throw(err);
  }
  
  return {
    name: result[0].name,
    state: result[0].state,
    message: result[0].message
  };
}
