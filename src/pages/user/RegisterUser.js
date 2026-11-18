import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import {postUser} from "../../comunication/FetchUser";
import PasswordStrength from "../../components/PasswordStrength";
import {getPasswordStrength} from "../../util/passwordRules";

//site key of google reCAPTCHA (public). Change it in the .env file, the default is the test key of google.
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

/**
 * RegisterUser
 * @author Peter Rutschmann
 */
function RegisterUser({loginValues, setLoginValues}) {
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);

    const initialState = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: ""
    };
    const [credentials, setCredentials] = useState(initialState);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        //check strength
        if (!getPasswordStrength(credentials.password).isStrong) {
            setErrorMessage('The password is too weak. Please fulfill all rules below the password field.');
            return;
        }

        //validate
        if(credentials.password !== credentials.passwordConfirmation) {
            console.log("password != passwordConfirmation");
            setErrorMessage('Password and password-confirmation are not equal.');
            return;
        }

        //captcha has to be solved
        if (!captchaToken) {
            setErrorMessage('Please confirm that you are not a robot.');
            return;
        }

        try {
            //the captcha token is sent to the backend, there it is checked at google
            await postUser({...credentials, recaptchaToken: captchaToken});
            //the secrets use email and password of the user
            setLoginValues({email: credentials.email, password: credentials.password});
            setCredentials(initialState);
            navigate('/');
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
            //a captcha token can only be used once
            recaptchaRef.current.reset();
            setCaptchaToken(null);
        }
    };

    return (
        <div>
            <h2>Register user</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Firstname:</label>
                            <input
                                type="text"
                                value={credentials.firstName}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, firstName: e.target.value}))}
                                required
                                placeholder="Please enter your firstname *"
                            />
                        </div>
                        <div>
                            <label>Lastname:</label>
                            <input
                                type="text"
                                value={credentials.lastName}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, lastName: e.target.value}))}
                                required
                                placeholder="Please enter your lastname *"
                            />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                value={credentials.email}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, email: e.target.value}))}
                                required
                                placeholder="Please enter your email"
                            />
                        </div>
                    </aside>
                    <aside>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                autoComplete="new-password"
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, password: e.target.value}))}
                                required
                                placeholder="Please enter your pwd *"
                            />
                            <PasswordStrength password={credentials.password}/>
                        </div>
                        <div>
                            <label>Password confirmation:</label>
                            <input
                                type="password"
                                autoComplete="new-password"
                                value={credentials.passwordConfirmation}
                                onChange={(e) =>
                                    setCredentials(prevValues => ({...prevValues, passwordConfirmation: e.target.value}))}
                                required
                                placeholder="Please confirm your pwd *"
                            />
                            {credentials.passwordConfirmation !== '' &&
                                credentials.password !== credentials.passwordConfirmation && (
                                    <p style={{color: '#c0392b', fontSize: '0.85rem'}}>The passwords are not equal.</p>
                                )}
                        </div>
                    </aside>
                </section>
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)}
                />
                <button type="submit">Register</button>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
        </div>
    );
}

export default RegisterUser;