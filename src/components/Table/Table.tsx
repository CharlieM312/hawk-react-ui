import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

import Use from '../Modal/Use';
import Instance from '../Modal/Instance';
import Get from '../../js/instances/Get';
import Create from '../../js/client/Create';

import styles from './Table.module.css';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import InstanceError from '../Modal/InstanceError';

type TableProps = {
  url: string;
}

type InstanceType = {
  name: string;
  status: string;
  info: string;
}

export default function Table({ url }: TableProps) {
  const { isOpen, toggle } = Use();
  let errorMessage = '';

  const states = [
    'RUNNING',
    'STOPPED',
    'UPDATING'
  ];

  let existingInstances: InstanceType[];
  try {
    const hawkClient = Create(url);
    const instances  = Get(hawkClient);

    const formatInstances = (instances: HawkInstance[]): InstanceType[] => {
      let formattedInstances: InstanceType[] = [];

      instances.forEach(function (instance: HawkInstance) {
        const typedInstance: InstanceType = {
          name: instance.name,
          status: states[instance.state],
          info: instance.message
        };

        formattedInstances.push(typedInstance);
      });

      return formattedInstances;
    }
    existingInstances = formatInstances(instances);
  } catch (err) {
    existingInstances = [];
    errorMessage = 'Failed to load instances. Reason: ' + err;
  }

  const [selectedInstance, setSelectedInstance] = useState(existingInstances[0]);

  const openModal = (instance: InstanceType) => {
    setSelectedInstance(instance);
    toggle();
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
                <tr onClick={() => {openModal(instance)}} key={instance.name}>
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
        <ErrorBoundary
          FallbackComponent={InstanceError}
        >
          <Instance
            isOpen={isOpen}
            toggle={toggle}
            instance={selectedInstance}
            url={url}
          />
        </ErrorBoundary>
      </>
      }
    </div>
  );
}
