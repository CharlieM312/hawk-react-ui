import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faPlayCircle, faStopCircle, faRefresh, faBan } from '@fortawesome/free-solid-svg-icons'

import Get from '../../js/instances/Get';
import Create from '../../js/client/Create';

import styles from './Table.module.css';
import { useState } from 'react';
import { useNavigate  } from 'react-router';
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
  const navigate = useNavigate();
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
  // eslint-disable-next-line
  const [selectedInstance, setSelectedInstance] = useState(existingInstances[0]);

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
                <tr onClick={() => { if(instance.status === 'RUNNING' || instance.status === 'UPDATING') {navigate(`/instance/${instance.name}`, { state: { instance: instance, url: url } }); }}} key={instance.name}>
                  <td>
                    <button
                     type="button"
                     className={styles.iconButton}
                     title={`Settings for ${instance.name}`}
                     aria-label={`Settings for ${instance.name}`}
                     onClick={async (e) => {
                      e.stopPropagation();

                      if (instance.status === 'RUNNING' || instance.status === 'UPDATING') {

                        setTimeout(() => {
                          navigate(`/instance/${instance.name}/settings`, { state: { instance: instance, url: url } });
                        }, 100);
                      }
                    }}
                     >
                      <FontAwesomeIcon className={styles.cog} icon={faGear} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      title={`Start ${instance.name}`}
                      aria-label={`Start ${instance.name}`}
                    onClick={async (e) => {
                      e.stopPropagation();

                      if (instance.status === 'STOPPED') {
                        const startInstanceNow = window.confirm(`Instance "${instance.name}" is currently STOPPED. Do you want to start it before opening settings?`);
                        if (!startInstanceNow) return;
                        try {
                          const hawkClient = Create(url);
                          await Promise.resolve(hawkClient.startInstance(instance.name));
                          alert(`${instance.name} started`);
                          window.location.reload();
                        } catch (err) {
                          alert(`Failed to start instance ${instance.name}. Reason: ${err}`);
                        }

                      } else if (instance.status === 'RUNNING' || instance.status === 'UPDATING') {
                        alert(`Instance "${instance.name}" is already running.`);
                      }
                    }}
                    >
                      <FontAwesomeIcon className={styles.play} icon={faPlayCircle} />
                    </button>
                    <button
                     type="button"
                     className={styles.iconButton}
                     title={`Sync ${instance.name}`}
                     aria-label={`Sync ${instance.name}`}
                    onClick={async (e) => {
                      e.stopPropagation();

                      if (instance.status === 'RUNNING') {
                        const syncInstanceNow = window.confirm(`Instance "${instance.name}" is currently RUNNING. Do you want to force synchronization?`);
                        if (!syncInstanceNow) return;
                        try {
                          const hawkClient = Create(url);
                          await Promise.resolve(hawkClient.syncInstance(instance.name, { blockUntilDone: true }));
                          alert(`${instance.name} synchronized`);
                        } catch (err) {
                          alert(`Failed to synchronize instance ${instance.name}. Reason: ${err}`);
                        }

                      }
                    }}
                    >
                      <FontAwesomeIcon className={styles.play} icon={faRefresh} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      title={`Stop ${instance.name}`}
                      aria-label={`Stop ${instance.name}`}
                      onClick={async (e) => {
                        e.stopPropagation();

                      if (instance.status === 'RUNNING') {
                        const stopInstanceNow = window.confirm(`Instance "${instance.name}" is currently RUNNING. Do you want to stop it?`);
                        if (!stopInstanceNow) return;
                        try {
                          const hawkClient = Create(url);
                          await Promise.resolve(hawkClient.stopInstance(instance.name));
                          alert(`${instance.name} stopped`);
                          window.location.reload();
                        } catch (err) {
                          alert(`Failed to stop instance ${instance.name}. Reason: ${err}`);
                        }

                      } else if (instance.status === 'STOPPED') {
                        alert(`Instance "${instance.name}" is already stopped.`);
                      }
                    }}
                    >
                     <FontAwesomeIcon className={styles.play} icon={faStopCircle}/>
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      title={`Delete ${instance.name}`}
                      aria-label={`Delete ${instance.name}`}
                    onClick={async (e) => {
                      e.stopPropagation();

                      if (instance.status === 'STOPPED') {
                        const deleteInstanceNow = window.confirm(`Instance "${instance.name}" is currently STOPPED. Do you want to delete it?`);
                        if (!deleteInstanceNow) return;
                        try {
                          const hawkClient = Create(url);
                          await Promise.resolve(hawkClient.removeInstance(instance.name));
                          alert(`${instance.name} deleted`);
                          window.location.reload();
                        } catch (err) {
                          alert(`Failed to delete instance ${instance.name}. Reason: ${err}`);
                        }

                      } else if (instance.status === 'RUNNING') {
                        alert(`Instance "${instance.name}" is running, and can't be deleted.`);
                      }
                    }}
                    >
                    <FontAwesomeIcon className={styles.play} icon={faBan} />
                    </button>
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
        </ErrorBoundary>
      </>
      }
    </div>
  );
}
