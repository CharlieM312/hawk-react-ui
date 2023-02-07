export default function Languages(hawkClient, instanceName) {
  let result;
  try {
    result = hawkClient.listQueryLanguages(instanceName);
  } catch (err) {
    throw(err);
  }

  return result;
}
