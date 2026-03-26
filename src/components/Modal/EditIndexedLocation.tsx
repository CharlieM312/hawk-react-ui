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


export default function EditIndexedLocation({title, isOpen, toggle, name, repoName, onCreated}: { title: string; isOpen: boolean; toggle: () => void; name: string; repoName: string; onCreated: () => void}) {

    const [loading, setLoading] = useState(false);
    const [types, setTypes]           = useState<string[]>([]);
    const [location, setLocation] = useState<string>("");
    const [frozen, setFrozen]     = useState<boolean>(false);

    const hawkClientRef = useRef<HawkClient | null>(null);

    const handleSubmission = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const frozenValue = formData.get('isFrozen') as string;
        const frozen = frozenValue != null;
        try {
            await hawkClientRef.current?.setFrozen(name, repoName, frozen);
            alert('Repository status changed');
            onCreated && onCreated();
            toggle();
        } catch (err) {
            console.error(err);
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
                const repositories: Repository[] = hawkClient.listRepositories(name);
                const repo: Repository | undefined = repositories.find((r) => r.uri === repoName);
                const types: string[] = hawkClient.listRepositoryTypes();
                if (repo) {
                    setTypes([repo.type]);
                    setLocation(repo.uri);
                    if (repo.isFrozen){
                        setFrozen(repo.isFrozen);
                    }
                } else {
                    setTypes(types);
                }

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
                <h1>Edit Repository</h1>
                <hr className={styles.separator} />
            </div>
            <div className={styles.close}>
                <CloseButton className={styles.closeButton} onClick={toggle} />
            </div>
        </div>
        <div className={styles.body}>
            <form onSubmit={handleSubmission}>
                <label className={styles.label}>Type</label>
                <select name="repositoryType" id="repositoryType" disabled={true} className={styles.input}>
                    {types.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <label className={styles.label}>Freeze repo</label>
                <input type="checkbox" name="isFrozen" defaultChecked={frozen} disabled={loading} className={styles.checkbox}/>
                <br></br>
                <input type="text" placeholder={location} disabled={true} className={styles.input}/>
                <button type="submit" disabled={loading} className={styles.input}>Submit

                </button>
            </form>
        </div>

    </Modal>
    );
}
