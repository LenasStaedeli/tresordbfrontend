/**
 * Fetch methodes for user api calls
 * @author Peter Rutschmann
 */

const protocol = process.env.REACT_APP_API_PROTOCOL; // "http"
const host = process.env.REACT_APP_API_HOST; // "localhost"
const port = process.env.REACT_APP_API_PORT; // "8080"
const path = process.env.REACT_APP_API_PATH; // "/api"
const portPart = port ? `:${port}` : ''; // port is optional
const API_URL = `${protocol}://${host}${portPart}${path}`;

//reads the error message from the response of the backend. The message can be a text or a list.
const readError = async (response) => {
    try {
        const errorData = await response.json();
        if (Array.isArray(errorData.message)) {
            return errorData.message.join(' ');
        }
        return errorData.message || 'Server response failed.';
    } catch (e) {
        return 'Server response failed.';
    }
};

export const getUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'Get',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(await readError(response));
        }

        const data = await response.json();
        console.log('User successfully got:', data);
        return data;
    } catch (error) {
        console.error('Failed to get user:', error.message);
        throw new Error('Failed to get user. ' + error.message);
    }
}

export const postUser = async (content) => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: `${content.firstName}`,
                lastName: `${content.lastName}`,
                email: `${content.email}`,
                password: `${content.password}`,
                passwordConfirmation: `${content.passwordConfirmation}`,
                recaptchaToken: `${content.recaptchaToken}`
            })
        });

        if (!response.ok) {
            throw new Error(await readError(response));
        }
        const data = await response.json();
        console.log('User successfully posted:', data);
        return data;
    } catch (error) {
        console.error('Failed to post user:', error.message);
        throw new Error(error.message);
    }
};

export const postUserLogin = async (content) => {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: `${content.email}`,
                password: `${content.password}`
            })
        });
        console.log(response);
        if (!response.ok) {
            throw new Error(await readError(response));
        }
        const data = await response.json();
        console.log('User successfully logged in:', data);
        return data;
    } catch (error) {
        console.error('Failed to login user:', error.message);
        throw new Error('Failed to login user. ' + error.message);
    }
};

//forgot password: the backend creates a reset link for this e-mail
export const postForgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_URL}/password/forgot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: `${email}`
            })
        });

        if (!response.ok) {
            throw new Error(await readError(response));
        }
        const data = await response.json();
        console.log('Forgot password requested:', data);
        return data;
    } catch (error) {
        console.error('Failed to request password reset:', error.message);
        throw new Error(error.message);
    }
};

//set a new password with the token from the reset link
export const postResetPassword = async (content) => {
    try {
        const response = await fetch(`${API_URL}/password/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: `${content.token}`,
                password: `${content.password}`,
                passwordConfirmation: `${content.passwordConfirmation}`
            })
        });

        if (!response.ok) {
            throw new Error(await readError(response));
        }
        const data = await response.json();
        console.log('Password was reset:', data);
        return data;
    } catch (error) {
        console.error('Failed to reset password:', error.message);
        throw new Error(error.message);
    }
};