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


export default function AddMetamodel({title, isOpen, name, toggle, onCreated}: { title: string; isOpen: boolean; name: string; toggle: () => void; onCreated: () => void}) {

    const [loading, setLoading] = useState(false);
    const [types, setTypes]           = useState<string[]>([]);

    let hawkClient: HawkClient;
    const hawkClientRef = useRef<HawkClient | null>(null);

    const handleSubmission = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

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
                <h1>Add Metamodel</h1>
                <hr className={styles.separator} />
            </div>
            <div className={styles.close}>
                <CloseButton className={styles.closeButton} onClick={toggle} />
            </div>
        </div>
        <div className={styles.body}>
            <form onSubmit={handleSubmission}>
                <input type="text" placeholder='example' name="Uri" className={styles.input}/>
            </form>
        </div>

    </Modal>


    );


}