import { CloseButton } from "react-bootstrap";
import Modal from "react-modal";
import styles  from "./New.module.css";
import { useEffect, useRef, useState } from "react";
import Create from "../../js/client/Create";

type Repository = {
    uri: string;
    type: string;
    isFrozen?: boolean;
}

type Credentials = {
    password: string;
    username: string;
}


export default function AddIndexedLocation({title, isOpen, name, toggle, onCreated}: { title: string; isOpen: boolean; name: string; toggle: () => void; onCreated: () => void}) {

    const [loading, setLoading] = useState(false);
    const [types, setTypes]           = useState<string[]>([]);

    let hawkClient: HawkClient;
    const hawkClientRef = useRef<HawkClient | null>(null);

    const handleSubmission = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const frozenValue = formData.get('isFrozen') as string;
        const frozen = frozenValue != null;
        const typeValue = formData.get('repositoryType') as string;
        const uriValue = formData.get('Uri') as string;
        const username = formData.get('Username') as string;
        const password = formData.get('Password') as string;

        const repositoryDetails: Repository = {
            uri: uriValue,
            type: typeValue,
            isFrozen: frozen
        };

        if (username != '' && password != ''){
            const credentialDetails: Credentials = {
                password: password,
                username: username
            };
            try {
                await hawkClientRef.current?.addRepository(name, repositoryDetails, credentialDetails);
                alert('Indexed location created successfully');
                onCreated && onCreated();
                toggle();
            } catch (err: any){
                if (err && err.message) console.error('Thrift message:', err.message);
                if (err && err.stack) console.error(err.stack);
                alert('Failed to create indexed location. See console and server logs.');
            }

        } else {
            try {
                await hawkClientRef.current?.addRepository(name, repositoryDetails);
                alert('Indexed location created successfully');
                onCreated && onCreated();
                toggle();
            } catch (err: any){
                if (err && err.message) console.error('Thrift message:', err.message);
                if (err && err.stack) console.error(err.stack);
                alert('Failed to create indexed location. See console and server logs.');
            }
        }


        

    };

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            setLoading(true);
            try {
                const envUrl = import.meta.env.VITE_APP_HAWK_URL ?? '';
                const hawkClient = Create(envUrl);
                hawkClientRef.current = hawkClient;
                const types: string[] = hawkClient.listRepositoryTypes();
                setTypes(types);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => { };
    }, [isOpen, name]);

    return (
    <Modal
      isOpen={isOpen}
      appElement={document.getElementById('root')!}
      contentLabel={title}
      className={styles.content}
      overlayClassName={styles.overlay}
    >
        <div className={styles.header}>
            <div className={styles.title}>
                <h1>Add Repository</h1>
                <hr className={styles.separator} />
            </div>
            <div className={styles.close}>
                <CloseButton className={styles.closeButton} onClick={toggle} />
            </div>
        </div>
        <div className={styles.body}>
            <form onSubmit={handleSubmission}>
                <label className={styles.label}>Type</label>
                <select name="repositoryType" id="repositoryType" className={styles.input}>
                    {types.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <input type="text" placeholder='uri' name="Uri" className={styles.input}/>
                <label className={styles.label}>Freeze repo?</label>
                <input type="checkbox" name="isFrozen" defaultChecked={false} disabled={loading} className={styles.checkbox}/>
                <br></br>
                <input type="text" placeholder='Username' name="Username" className={styles.input}/>
                <input type="password" placeholder="Password" name="Password" className={styles.input}/>
                <button type="submit" disabled={loading} className={styles.input}>Submit
                </button>
            </form>
        </div>

    </Modal>


    );


}