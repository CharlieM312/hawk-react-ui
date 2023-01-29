import Use from '../Modal/Use';
import Instance from '../Modal/Instance';
import Get from '../../js/instances/Get';
import styles from './Table.module.css';

export default function Table() {
  const { isOpen, toggle } = Use();

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
              <tr onClick={toggle} key={ instance.name }>
                <td>{ instance.name }</td>
                <td>{ instance.location }</td>
                <td>{ instance.status }</td>
                <td>{ instance.info }</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {<Instance
        isOpen={isOpen}
        toggle={toggle}
        instance={existingInstances[0]}
      />}
    </div>
  );
}
