import { CloseButton } from "react-bootstrap";
import Modal from "react-modal";
import styles  from "./New.module.css";
import { useEffect, useRef, useState } from "react";
import Create from "../../js/client/Create";

type DerivedAttributeSpec = {
    attributeName: string;
    attributeType?: string;
    derivationLanguage?: string;
    derivationLogic?: string;
    isMany?: boolean;
    isOrdered?: boolean;
    isUnique?: boolean;
    metamodelUri: string;
    typeName: string;
}


export default function NewDerivedAttribute({title, isOpen, toggle, name, onCreated}: { title: string; isOpen: boolean; toggle: () => void; name: string; onCreated: () => void}) {

    const [loading, setLoading] = useState(false);
    const [metaModels, setMetaModels]         = useState<string[]>([]);
    const [languages, setLanguages]           = useState<string[]>([]);
    const [typeNames, setTypeNames]           = useState<string[]>([]);

    const hawkClientRef = useRef<HawkClient | null>(null);

    const handleSubmission = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const attributeName = formData.get('attributeName') as string;
        const metamodelUri = formData.get('metamodel') as string;
        const typeName = formData.get('type') as string;
        const attributeType = formData.get('attributetype') as string;
        const Many = formData.get('isMany') as string;
        const Ordered = formData.get('isOrdered') as string;
        const Unique = formData.get('isUnique') as string;
        const derivationLanguage = formData.get('derivationLanguage') as string;
        const rawDerivationLogic = formData.get('derivationLogic') as string;
        var derivationLogic = rawDerivationLogic ? rawDerivationLogic.trim() : '';
        if (attributeName == "" || attributeName == null) {
            alert('Please enter an attribute name.');
            return;
        }
        var myDerivedAttribute: DerivedAttributeSpec = {attributeName, attributeType, derivationLanguage, derivationLogic, metamodelUri, typeName};
        if (Many != null){
            const isMany = Many != null;
            const isOrdered = Ordered != null;
            const isUnique = Unique != null;
            var myDerivedAttribute: DerivedAttributeSpec = {attributeName, attributeType, derivationLanguage, derivationLogic, isMany, isOrdered, isUnique, metamodelUri, typeName};
        }
        try {
            if (!hawkClientRef.current) return;
            await hawkClientRef.current.addDerivedAttribute(name, myDerivedAttribute);
            alert('Derived attribute created successfully');
            onCreated && onCreated();
            toggle();
        } catch (err: any) {
            console.error('Create derived attribute failed. args:', {
                attributeName, typeName, Many, Ordered, Unique, derivationLanguage
            });
            console.error('Thrift error/full object:', err);
            if (err && err.message) console.error('Thrift message:', err.message);
            if (err && err.stack) console.error(err.stack);
            alert('Failed to create derived attribute. See console and server logs.');
        }

    };

    const updateTypeNames = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const metamodelValue = e.target.value;
        if (!hawkClientRef.current) return;
        const typeNames = await hawkClientRef.current.listTypeNames(name, metamodelValue);
        setTypeNames(typeNames);
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
                const languages = await hawkClient.listQueryLanguages(name);
                const typeNames = await hawkClientRef.current.listTypeNames(name, sortedModels[0]);
                setTypeNames(typeNames);
                setLanguages(languages);
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
                <h1>Create new derived attribute</h1>
                <hr className={styles.separator} />
            </div>
            <div className={styles.close}>
                <CloseButton className={styles.closeButton} onClick={toggle} />
            </div>
        </div>
        <div className={styles.body}>
            <form onSubmit={handleSubmission}>
                <input type="text" name="attributeName" disabled={loading} placeholder="Name" className={styles.input} />
                <label className={styles.label}>Metamodel URI</label>
                <select aria-label="Metamodel URI" name="metamodel" id="metamodel" disabled={loading} className={styles.input} onChange={updateTypeNames}>
                    {metaModels.map((metamodel) => (
                        <option key={metamodel} value={metamodel}>{metamodel}</option>
                    ))}
                </select>
                <label className={styles.label}>Type Name</label>
                <select aria-label="Type Name" name="type" id="type" disabled={loading} className={styles.input}>
                    {typeNames.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <label className={styles.label}>Attribute Type</label>
                <select aria-label="Attribute Type" name="attributetype" id="attributetype" disabled={loading} className={styles.input}>
                    <option key={"string"} value={"String"}>String</option>
                    <option key={"integer"} value={"Integer"}>Integer</option>
                    <option key={"boolean"} value={"Boolean"}>Boolean</option>
                    <option key={"timelineAnnotation"} value={"TimelineAnnotation"}>TimelineAnnotation</option>
                </select>
                <label className={styles.label}>isMany</label>
                <input type="checkbox" aria-label="isMany" name="isMany" disabled={loading} className={styles.checkbox}/>
                <br></br>
                <label className={styles.label}>isOrdered</label>
                <input type="checkbox" name="isOrdered" disabled={loading} className={styles.checkbox}/>
                <br></br>
                <label className={styles.label}>isUnique</label>
                <input type="checkbox" name="isUnique" disabled={loading} className={styles.checkbox}/>
                <br></br>
                <label className={styles.label}>Derivation Language</label>
                <select name="derivationLanguage" id="derivationLanguage" disabled={loading} className={styles.input}>
                    {languages.map((language) => (
                        <option key={language} value={language}>{language}</option>
                    ))}
                </select>
                <input type="text" name="derivationLogic" disabled={loading} placeholder="Derivation Logic" className={styles.input}/>
                <button type="submit" disabled={loading} className={styles.input}>Submit

                </button>
            </form>
        </div>

    </Modal>
    );
}
