import React from 'react';
import {getPasswordStrength} from '../util/passwordRules';

/**
 * PasswordStrength
 * Shows a bar, the strength as text and the list of rules for the given password.
 * It is calculated again with every input.
 * @author Peter Rutschmann
 */
const PasswordStrength = ({password}) => {
    const strength = getPasswordStrength(password);

    return (
        <div style={{marginBottom: '1rem'}}>
            <div style={{background: '#e9e9e9', height: '8px', borderRadius: '4px'}}>
                <div style={{
                    width: strength.percent + '%',
                    height: '100%',
                    borderRadius: '4px',
                    background: strength.color
                }}/>
            </div>
            <p style={{margin: '0.3rem 0', fontSize: '0.9rem'}}>
                Password strength: <b style={{color: strength.color}}>{password ? strength.label : '-'}</b> ({strength.percent}%)
            </p>
            <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem'}}>
                {strength.results.map(rule => (
                    <li key={rule.text} style={{color: rule.ok ? '#2e8b57' : '#777'}}>
                        {rule.ok ? '✓' : '✗'} {rule.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordStrength;