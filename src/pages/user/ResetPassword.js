import React, {useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {postResetPassword} from "../../comunication/FetchUser";
import PasswordStrength from "../../components/PasswordStrength";
import {getPasswordStrength} from "../../util/passwordRules";

/**
 * ResetPassword
 *   The user opened the link from the reset mail and enters a new password.
 *   The token is part of the link: /user/reset?token=...
 * @author Peter Rutschmann
 */
function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [understood, setUnderstood] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (token === '') {
            setErrorMessage('The link is not valid, the token is missing.');
            return;
        }

        //check strength
        if (!getPasswordStrength(password).isStrong) {
            setErrorMessage('The password is too weak. Please fulfill all rules below the password field.');
            return;
        }

        if (password !== passwordConfirmation) {
            setErrorMessage('Password and password-confirmation are not equal.');
            return;
        }

        if (!understood) {
            setErrorMessage('Please confirm that your old secrets will be deleted.');
            return;
        }

        try {
            await postResetPassword({token, password, passwordConfirmation});
            setDone(true);
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
        }
    };

    if (done) {
        return (
            <div>
                <h2>Password reset</h2>
                <p>Your password was changed. You can now log in with your new password.</p>
                <p><Link to="/user/login">Go to login</Link></p>
            </div>
        );
    }

    return (
        <div>
            <h2>Set a new password</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>New password:</label>
                    <input
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Please enter your new password *"
                    />
                    <PasswordStrength password={password}/>
                </div>
                <div>
                    <label>Password confirmation:</label>
                    <input
                        type="password"
                        autoComplete="new-password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                        placeholder="Please confirm your new password *"
                    />
                    {passwordConfirmation !== '' && password !== passwordConfirmation && (
                        <p style={{color: '#c0392b', fontSize: '0.85rem'}}>The passwords are not equal.</p>
                    )}
                </div>
                <p>
                    <b>Please note:</b> Your secrets were encrypted with your old password. They can not be decrypted
                    with the new password and will be deleted.
                </p>
                <label>
                    <input
                        type="checkbox"
                        checked={understood}
                        onChange={(e) => setUnderstood(e.target.checked)}
                    />
                    {' '}I understand that my existing secrets will be deleted.
                </label>
                <button type="submit">Set new password</button>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
        </div>
    );
}

export default ResetPassword;