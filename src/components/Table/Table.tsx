import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

import Use from '../Modal/Use';
import Instance from '../Modal/Instance';
import Get from '../../js/instances/Get';
import Create from '../../js/client/Create';

import styles from './Table.module.css';

type TableProps = {
  url: string;
}

export default function Table({ url }: TableProps) {
  const { isOpen, toggle } = Use();
  let errorMessage = '';

  type InstanceType = {
    name: string;
    status: string;
    info: string;
  }

  const states = [
    'RUNNING',
    'STOPPED',
    'UPDATING'
  ];

  let existingInstances: InstanceType[];
  try {
    const hawkClient = Create(url);
    const instances  = Get(hawkClient);

    const formatInstances = (instances: HawkInstance): InstanceType[] => {
      let formattedInstances: InstanceType[] = [];

      const typedInstance: InstanceType = {
        name: instances.name,
        status: states[instances.state],
        info: instances.message
      };
      formattedInstances.push(typedInstance);

      return formattedInstances;
    }
    existingInstances = formatInstances(instances);
  } catch (err) {
    existingInstances = [];
    errorMessage = 'Failed to load instances. Reason: ' + err;
  }

  return (
    <div className={styles.table}>
      {errorMessage.length !== 0 && <h2 className={styles.errorMessage}>{ errorMessage }</h2>}
      {errorMessage.length === 0 && existingInstances.length === 0 && <h2 className={styles.noInstances}>No instances are currently running</h2>}
      {existingInstances.length > 0 &&
      <>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {existingInstances.map(instance => {
              return (
                <tr onClick={toggle} key={instance.name}>
                  <td>
                    <FontAwesomeIcon className={styles.cog} icon={faGear} />
                    {instance.name}
                  </td>
                  <td>{instance.status}</td>
                  <td>{instance.info}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Instance
            isOpen={isOpen}
            toggle={toggle}
            instance={existingInstances[0]}
            url={url}
        />
      </>
      }
    </div>
  );
}
