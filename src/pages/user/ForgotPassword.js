import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {postForgotPassword} from "../../comunication/FetchUser";

/**
 * ForgotPassword
 *   The user enters the e-mail and gets a link to reset the password.
 * @author Peter Rutschmann
 */
function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErrorMessage('');

        try {
            await postForgotPassword(email);
            //same message, whether the e-mail exists or not
            setMessage('If this e-mail is registered, a link to reset the password was created. '
                + 'In this school project no e-mail is sent, the link is written to the console of the backend.');
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div>
            <h2>Forgot password</h2>
            <p>
                <b>Please note:</b> Your secrets are encrypted with your password. After a reset they can not be
                decrypted anymore and will be deleted.
            </p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Please enter your email *"
                    />
                </div>
                <button type="submit">Request reset link</button>
                {message && <p>{message}</p>}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
            <p><Link to="/user/login">Back to login</Link></p>
        </div>
    );
}

export default ForgotPassword;