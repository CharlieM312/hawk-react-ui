import { CloseButton } from "react-bootstrap";
import Modal from "react-modal";
import styles  from "./New.module.css";
import { useEffect, useRef, useState } from "react";
import Create from "../../js/client/Create";

type IndexedAttributeSpec = {
    attributeName: string;
    metamodelUri: string;
    typeName: string;
}


export default function NewIndexedAttribute({title, isOpen, toggle, name, onCreated}: { title: string; isOpen: boolean; toggle: () => void; name: string; onCreated: () => void}) {

    const [loading, setLoading] = useState(false);
    const [metaModels, setMetaModels]         = useState<string[]>([]);
    const [typeNames, setTypeNames]           = useState<string[]>([]);
    const [attributeNames, setAttributeNames] = useState<string[]>([]);

    const hawkClientRef = useRef<HawkClient | null>(null);

    const handleSubmission = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const attributeName = formData.get('attribute') as string;
        const metamodelUri = formData.get('metamodel') as string;
        const typeName = formData.get('type') as string;
        // Attribute name can be empty in a couple of cases so going to keep this
        if (attributeName == "" || attributeName == null) {
            alert('Please enter an attribute name.');
            return;
        }
        var myIndexedAttribute: IndexedAttributeSpec = {attributeName, metamodelUri, typeName};
        try {
            if (!hawkClientRef.current) return;
            await hawkClientRef.current.addIndexedAttribute(name, myIndexedAttribute);
            alert('Indexed attribute created successfully');
            onCreated && onCreated();
            toggle();
        } catch (err: any) {
            console.error('Create indexed attribute failed. args:', {
                attributeName, typeName, metamodelUri
            });
            console.error('Thrift error/full object:', err);
            if (err && err.message) console.error('Thrift message:', err.message);
            if (err && err.stack) console.error(err.stack);
            alert('Failed to create indexed attribute. See console and server logs.');
        }

    };

    const updateTypeNames = async (_e: React.ChangeEvent<HTMLSelectElement>) => {
        const metamodelHTML = document.getElementById("metamodel") as HTMLSelectElement;
        const metamodelValue = metamodelHTML.value;
        if (!hawkClientRef.current) return;
        const typeNames = await hawkClientRef.current.listTypeNames(name, metamodelValue);
        setTypeNames(typeNames);
    };

    const updateAttributeNames = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const metamodelHTML = document.getElementById("metamodel") as HTMLSelectElement;
        const metamodelValue = metamodelHTML.value;
        const typeValue = e.target.value;
        if (!hawkClientRef.current) return;
        const attributeNames = await hawkClientRef.current.listAttributeNames(name, metamodelValue, typeValue);
        setAttributeNames(attributeNames);
    };

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            setLoading(true);
            try {
                const envUrl = import.meta.env.VITE_APP_HAWK_URL ?? '';
                const hawkClient = Create(envUrl);
                hawkClientRef.current = hawkClient;
                const models: string[] = await hawkClient.listMetamodels(name);
                const sortedModels = models.sort();
                const typeNames = await hawkClientRef.current.listTypeNames(name, sortedModels[0]);
                const attributeNames = await hawkClientRef.current.listAttributeNames(name, sortedModels[0], typeNames[0]);
                setAttributeNames(attributeNames);
                setTypeNames(typeNames);
                setMetaModels(sortedModels);
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
                <h1>Create new indexed attribute</h1>
                <hr className={styles.separator} />
            </div>
            <div className={styles.close}>
                <CloseButton className={styles.closeButton} onClick={toggle} />
            </div>
        </div>
        <div className={styles.body}>
            <form onSubmit={handleSubmission}>
                <label className={styles.label}>Metamodel URI</label>
                <select aria-label="Metamodel URI" name="metamodel" id="metamodel" disabled={loading} className={styles.input} onChange={updateTypeNames}>
                    {metaModels.map((metamodel) => (
                        <option key={metamodel} value={metamodel}>{metamodel}</option>
                    ))}
                </select>
                <label className={styles.label}>Type Name</label>
                <select aria-label="Type Name" name="type" id="type" disabled={loading} className={styles.input} onChange={updateAttributeNames}>
                    {typeNames.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <label className={styles.label}>Attribute Name</label>
                <select aria-label="Attribute Name" name="attribute" id="attribute" disabled={loading} className={styles.input}>
                    {attributeNames.map((attribute) => (
                        <option key={attribute} value={attribute}>{attribute}</option>
                    ))}
                </select>
                <button type="submit" disabled={loading} className={styles.input}>Submit

                </button>
            </form>
        </div>

    </Modal>


    );


}