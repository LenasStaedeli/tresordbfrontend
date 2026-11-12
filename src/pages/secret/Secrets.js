import '../../App.css';
import React, {useEffect, useState} from 'react';
import {getSecretsforUser, putSecret, deleteSecret} from "../../comunication/FetchSecrets";

/**
 * Secrets
 * Shows the secrets of the user depending on the kind. Secrets can be edited and deleted.
 * @author Peter Rutschmann
 */
const Secrets = ({loginValues}) => {
    const [secrets, setSecrets] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [editId, setEditId] = useState(null);         // id of the secret which is edited
    const [editContent, setEditContent] = useState({}); // values in the edit form

    //title and icon for every kind of secret
    const kinds = {
        credential: {title: 'Credential', icon: '🔑'},
        creditcard: {title: 'Credit card', icon: '💳'},
        note: {title: 'Note', icon: '📝'}
    };

    const boxStyle = {border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem'};

    const fetchSecrets = async () => {
        setErrorMessage('');
        if (!loginValues.email) {
            console.error('Secrets: No valid email, please do login first:' + loginValues);
            setErrorMessage("No valid email, please do login first.");
        } else {
            try {
                const data = await getSecretsforUser(loginValues);
                console.log(data);
                setSecrets(data);
            } catch (error) {
                console.error('Failed to fetch to server:', error.message);
                setErrorMessage(error.message);
            }
        }
    };

    useEffect(() => {
        fetchSecrets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginValues]);

    //the content of a secret is a json text. If it could not be decrypted, it is no json.
    const parseContent = (secret) => {
        try {
            return JSON.parse(secret.content);
        } catch (e) {
            return null;
        }
    };

    const startEdit = (secret, content) => {
        setEditId(secret.id);
        setEditContent(content);
    };

    const handleSave = async () => {
        setErrorMessage('');
        try {
            await putSecret({secretId: editId, loginValues, content: editContent});
            setEditId(null);
            fetchSecrets();
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleDelete = async (secretId) => {
        if (!window.confirm('Delete this secret?')) {
            return;
        }
        setErrorMessage('');
        try {
            await deleteSecret(secretId);
            fetchSecrets();
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <>
            <h1>my secrets</h1>
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}

            {secrets.length === 0 && <p>No secrets available</p>}

            {secrets.map(secret => {
                const content = parseContent(secret);

                //secret could not be decrypted
                if (!content || !kinds[content.kind]) {
                    return (
                        <div key={secret.id} style={boxStyle}>
                            <h3>🔒 Secret {secret.id}</h3>
                            <p>{secret.content}</p>
                            <button type="button" onClick={() => handleDelete(secret.id)}>Delete</button>
                        </div>
                    );
                }

                //all fields of the secret, except the type
                const fields = Object.keys(content).filter(key => key !== 'kindid' && key !== 'kind');

                return (
                    <div key={secret.id} style={boxStyle}>
                        <h3>{kinds[content.kind].icon} {kinds[content.kind].title}</h3>

                        {editId === secret.id ? (
                            <>
                                {fields.map(key => (
                                    <div key={key}>
                                        <label>{key}</label>
                                        <input
                                            type="text"
                                            value={editContent[key] || ''}
                                            onChange={(e) => setEditContent({...editContent, [key]: e.target.value})}
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={handleSave}>Save</button>
                                <button type="button" onClick={() => setEditId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                {fields.map(key => (
                                    <p key={key}><b>{key}:</b> {content[key]}</p>
                                ))}
                                <button type="button" onClick={() => startEdit(secret, content)}>Edit</button>
                                <button type="button" onClick={() => handleDelete(secret.id)}>Delete</button>
                            </>
                        )}
                    </div>
                );
            })}
        </>
    );
};

export default Secrets;