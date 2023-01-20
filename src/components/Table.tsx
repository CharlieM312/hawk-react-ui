import UseModal from './UseModal';
import InstanceModal from './InstanceModal';
import Get from '../js/instances/Get';
import styles from '../styles/table.module.css';

export default function Table() {
  const { isOpen, toggle } = UseModal();

  type InstanceType = {
    name: string;
    location: string;
    status: string;
    info: string;
  }

  const states = [
    'RUNNING',
    'STOPPED',
    'UPDATING'
  ]

  let instances = Get();
  const createInstances = (instances: HawkInstance): InstanceType[] => {
    let createdInstances: InstanceType[] = [];

    let typedInstance: InstanceType = {
      name: instances.name,
      location: 'location',
      status: states[instances.state],
      info: instances.message
    };
    createdInstances.push(typedInstance);

    return createdInstances;
  }
  let existingInstances = createInstances(instances);

  return (
    <div className={styles.table}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {existingInstances.map(instance => {
            return (
              <tr onClick={toggle}>
                <td>{ instance.name }</td>
                <td>{ instance.location }</td>
                <td>{ instance.status }</td>
                <td>{ instance.info }</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {<InstanceModal
        isOpen={isOpen}
        toggle={toggle}
        instance={existingInstances[0]}
      />}
    </div>
  );
}
