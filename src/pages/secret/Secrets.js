import '../../App.css';
import '../../css/secrets.css';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {getSecretsforUser, putSecret, deleteSecret} from "../../comunication/FetchSecrets";

/**
 * Secrets
 *   shows all secrets of the logged in user as cards, depending on the kind of the secret.
 *   Secrets can be edited and deleted.
 * @author Peter Rutschmann
 */

const KINDS = {
    credential: {label: 'Credential', icon: '🔑'},
    creditcard: {label: 'Credit card', icon: '💳'},
    note: {label: 'Note', icon: '📝'},
};

//fields per kind, used for view and edit
const FIELDS = {
    credential: [
        {key: 'userName', label: 'Username'},
        {key: 'password', label: 'Password', secret: true},
        {key: 'url', label: 'URL', link: true},
    ],
    creditcard: [
        {key: 'cardtype', label: 'Card type', options: ['Visa', 'Mastercard']},
        {key: 'cardnumber', label: 'Card number', secret: true},
        {key: 'expiration', label: 'Expiration (mm/yy)'},
        {key: 'cvv', label: 'CVV', secret: true},
    ],
    note: [
        {key: 'title', label: 'Title'},
        {key: 'content', label: 'Content', multiline: true},
    ],
};

//content comes as json string from the backend. Not decryptable secrets are no json.
const parseContent = (raw) => {
    if (raw && typeof raw === 'object') return raw;
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
        return null;
    }
};

const getTitle = (parsed) => {
    switch (parsed.kind) {
        case 'credential':
            return parsed.url || parsed.userName || 'Credential';
        case 'creditcard': {
            const number = String(parsed.cardnumber || '').replace(/\s/g, '');
            return `${parsed.cardtype || 'Card'} •••• ${number.slice(-4)}`;
        }
        case 'note':
            return parsed.title || 'Note';
        default:
            return 'Secret';
    }
};

//value with optional mask, show/hide and copy button
const SecretValue = ({value, secret, link}) => {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const text = value === undefined || value === null ? '' : String(value);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            console.error('Copy failed:', e.message);
        }
    };

    const masked = secret && !visible;
    const href = /^https?:\/\//i.test(text) ? text : `https://${text}`;

    return (
        <span className="sc-value">
            {masked ? (
                <span className="sc-masked">••••••••</span>
            ) : link && text ? (
                <a href={href} target="_blank" rel="noopener noreferrer">{text}</a>
            ) : (
                <span>{text || '–'}</span>
            )}
            {secret && (
                <button type="button" className="sc-icon-btn" onClick={() => setVisible(v => !v)}
                        title={visible ? 'hide' : 'show'}>
                    {visible ? '🙈' : '👁'}
                </button>
            )}
            {text && (
                <button type="button" className="sc-icon-btn" onClick={copy} title="copy">
                    {copied ? '✔' : '📋'}
                </button>
            )}
        </span>
    );
};

const SecretCard = ({secret, parsed, onSave, onDelete}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState({});
    const [busy, setBusy] = useState(false);
    const [cardError, setCardError] = useState('');

    const handleDelete = async () => {
        if (!window.confirm('Delete this secret?')) return;
        setBusy(true);
        setCardError('');
        try {
            await onDelete(secret.id);
        } catch (error) {
            setCardError(error.message);
            setBusy(false);
        }
    };

    //secret can not be decrypted (wrong password or not encrypted)
    if (!parsed || !FIELDS[parsed.kind]) {
        return (
            <div className="sc-card kind-error">
                <div className="sc-card-header">
                    <span className="sc-card-icon">🔒</span>
                    <div>
                        <div className="sc-card-title">Secret #{secret.id}</div>
                        <div className="sc-card-kind">not readable</div>
                    </div>
                </div>
                <p>This secret can not be decrypted. Wrong password?</p>
                {cardError && <p className="sc-error">{cardError}</p>}
                <div className="sc-actions">
                    <button type="button" className="sc-btn-danger" onClick={handleDelete} disabled={busy}>
                        Delete
                    </button>
                </div>
            </div>
        );
    }

    const kind = KINDS[parsed.kind];
    const fields = FIELDS[parsed.kind];

    const startEdit = () => {
        setDraft({...parsed});
        setCardError('');
        setIsEditing(true);
    };

    const handleSave = async () => {
        setBusy(true);
        setCardError('');
        try {
            //keep kindid and kind from the original, overwrite the edited values
            await onSave(secret.id, {...parsed, ...draft});
            setIsEditing(false);
        } catch (error) {
            setCardError(error.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={`sc-card kind-${parsed.kind}`}>
            <div className="sc-card-header">
                <span className="sc-card-icon">{kind.icon}</span>
                <div>
                    <div className="sc-card-title">{getTitle(parsed)}</div>
                    <div className="sc-card-kind">{kind.label} · #{secret.id}</div>
                </div>
            </div>

            {isEditing ? (
                fields.map(field => (
                    <div className="sc-edit-field" key={field.key}>
                        <label>{field.label}</label>
                        {field.options ? (
                            <select value={draft[field.key] || ''}
                                    onChange={(e) => setDraft(prev => ({...prev, [field.key]: e.target.value}))}>
                                {field.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : field.multiline ? (
                            <textarea rows={4} value={draft[field.key] || ''}
                                      onChange={(e) => setDraft(prev => ({...prev, [field.key]: e.target.value}))}/>
                        ) : (
                            <input type={field.secret ? 'password' : 'text'}
                                   value={draft[field.key] || ''}
                                   onChange={(e) => setDraft(prev => ({...prev, [field.key]: e.target.value}))}/>
                        )}
                    </div>
                ))
            ) : (
                fields.map(field => (
                    <div className="sc-row" key={field.key}>
                        <span className="sc-label">{field.label}</span>
                        <SecretValue value={parsed[field.key]} secret={field.secret} link={field.link}/>
                    </div>
                ))
            )}

            {cardError && <p className="sc-error">{cardError}</p>}

            <div className="sc-actions">
                {isEditing ? (
                    <>
                        <button type="button" onClick={handleSave} disabled={busy}>Save</button>
                        <button type="button" className="sc-btn-secondary" onClick={() => setIsEditing(false)}
                                disabled={busy}>Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" onClick={startEdit} disabled={busy}>Edit</button>
                        <button type="button" className="sc-btn-danger" onClick={handleDelete} disabled={busy}>
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const Secrets = ({loginValues}) => {
    const [secrets, setSecrets] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [kindFilter, setKindFilter] = useState('all');
    const [search, setSearch] = useState('');

    const loadSecrets = useCallback(async () => {
        setErrorMessage('');
        if (!loginValues.email) {
            console.error('Secrets: No valid email, please do login first.');
            setErrorMessage("No valid email, please do login first.");
            return;
        }
        setLoading(true);
        try {
            const data = await getSecretsforUser(loginValues);
            setSecrets(data);
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    }, [loginValues]);

    useEffect(() => {
        loadSecrets();
    }, [loadSecrets]);

    const handleSave = async (secretId, content) => {
        await putSecret({secretId, loginValues, content});
        await loadSecrets();
    };

    const handleDelete = async (secretId) => {
        await deleteSecret(secretId);
        await loadSecrets();
    };

    const items = useMemo(
        () => secrets.map(secret => ({secret, parsed: parseContent(secret.content)})),
        [secrets]
    );

    const counts = useMemo(() => {
        const result = {all: items.length, credential: 0, creditcard: 0, note: 0};
        items.forEach(({parsed}) => {
            if (parsed && result[parsed.kind] !== undefined) result[parsed.kind] += 1;
        });
        return result;
    }, [items]);

    const visibleItems = items.filter(({parsed}) => {
        if (kindFilter !== 'all' && (!parsed || parsed.kind !== kindFilter)) return false;
        if (search.trim() === '') return true;
        if (!parsed) return false;
        return JSON.stringify(parsed).toLowerCase().includes(search.trim().toLowerCase());
    });

    return (
        <>
            <h1>my secrets</h1>
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}

            <div className="sc-toolbar">
                <input type="text" placeholder="Search secrets..." value={search}
                       onChange={(e) => setSearch(e.target.value)}/>
                <button type="button" className={`sc-filter-btn ${kindFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setKindFilter('all')}>
                    All ({counts.all})
                </button>
                {Object.entries(KINDS).map(([kindKey, kind]) => (
                    <button type="button" key={kindKey}
                            className={`sc-filter-btn ${kindFilter === kindKey ? 'active' : ''}`}
                            onClick={() => setKindFilter(kindKey)}>
                        {kind.icon} {kind.label} ({counts[kindKey]})
                    </button>
                ))}
            </div>

            {loading && <p>Loading...</p>}

            {!loading && visibleItems.length === 0 && !errorMessage && (
                <p className="sc-empty">No secrets available</p>
            )}

            <div className="sc-grid">
                {visibleItems.map(({secret, parsed}) => (
                    <SecretCard key={secret.id} secret={secret} parsed={parsed}
                                onSave={handleSave} onDelete={handleDelete}/>
                ))}
            </div>
        </>
    );
};

export default Secrets;