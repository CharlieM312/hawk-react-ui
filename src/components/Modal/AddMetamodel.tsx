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

    let hawkClient: HawkClient;
    const hawkClientRef = useRef<HawkClient | null>(null);

    const handleSubmission = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const metamodelFile = formData.getAll("metamodelFile") as File[];
        if (!hawkClientRef.current){
            return;
        }
        try {
            await hawkClientRef.current.registerMetamodels(name, metamodelFile);
            alert('Metamodel created successfully');
            onCreated && onCreated();
            toggle();
        } catch (err: any) {
            console.error('Create metamodel failed.');
            console.error('Thrift error/full object:', err);
            alert('Failed to create metamodel');
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
                <label className={styles.label}>Upload Metamodel File</label>
                <input required type="file" multiple placeholder='Upload Metamodel File' name="metamodelFile" className={styles.input}/>
                <button type="submit" disabled={loading} className={styles.input}>Submit</button>
            </form>
        </div>

    </Modal>


    );


}