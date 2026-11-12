/**
 * Fetch methodes for secret api calls
 * @author Peter Rutschmann
 */

const protocol = process.env.REACT_APP_API_PROTOCOL; // "http"
const host = process.env.REACT_APP_API_HOST; // "localhost"
const port = process.env.REACT_APP_API_PORT; // "8080"
const path = process.env.REACT_APP_API_PATH; // "/api"
const portPart = port ? `:${port}` : ''; // port is optional
const API_URL = `${protocol}://${host}${portPart}${path}`;

//Post secret to server
export const postSecret = async ({loginValues, content}) => {
    try {
        const response = await fetch(`${API_URL}/secrets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginValues.email,
                encryptPassword: loginValues.password,
                content: content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server response failed.');
        }

        const data = await response.json();
        console.log('Secret successfully posted:', data);
        return data;
    } catch (error) {
        console.error('Error posting secret:', error.message);
        throw new Error('Failed to save secret. ' + error.message);
    }
};

//get all secrets for a user identified by its email
export const getSecretsforUser = async (loginValues) => {
    try {
        const response = await fetch(`${API_URL}/secrets/byemail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginValues.email,
                encryptPassword: loginValues.password
            })
        });

        //404 means: the user has no secrets yet
        if (response.status === 404) {
            return [];
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server response failed.');
        }
        const data = await response.json();
        console.log('Secret successfully got:', data);
        return data;
    } catch (error) {
        console.error('Failed to get secrets:', error.message);
        throw new Error('Failed to get secrets. ' + error.message);
    }
};

//change a secret
export const putSecret = async ({secretId, loginValues, content}) => {
    try {
        const response = await fetch(`${API_URL}/secrets/${secretId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginValues.email,
                encryptPassword: loginValues.password,
                content: content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.answer || 'Server response failed.');
        }

        const data = await response.json();
        console.log('Secret successfully updated:', data);
        return data;
    } catch (error) {
        console.error('Error updating secret:', error.message);
        throw new Error('Failed to update secret. ' + error.message);
    }
};

//delete a secret
export const deleteSecret = async (secretId) => {
    try {
        const response = await fetch(`${API_URL}/secrets/${secretId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Server response failed.');
        }
        console.log('Secret successfully deleted');
    } catch (error) {
        console.error('Error deleting secret:', error.message);
        throw new Error('Failed to delete secret. ' + error.message);
    }
};