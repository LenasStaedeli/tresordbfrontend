/**
 * Fetch methodes for secret api calls
 * @author Peter Rutschmann
 */

const getApiUrl = () => {
    const protocol = process.env.REACT_APP_API_PROTOCOL; // "http"
    const host = process.env.REACT_APP_API_HOST; // "localhost"
    const port = process.env.REACT_APP_API_PORT; // "8080"
    const path = process.env.REACT_APP_API_PATH; // "/api"
    const portPart = port ? `:${port}` : ''; // port is optional
    return `${protocol}://${host}${portPart}${path}`;
};

//read the error message of a failed response (body may be empty or not json)
const readError = async (response) => {
    try {
        const errorData = await response.json();
        const message = errorData.message || errorData.answer;
        if (Array.isArray(message)) return message.join(', ');
        return message || 'Server response failed.';
    } catch (e) {
        return 'Server response failed.';
    }
};

//Post secret to server
export const postSecret = async ({loginValues, content}) => {
    try {
        const response = await fetch(`${getApiUrl()}/secrets`, {
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
            throw new Error(await readError(response));
        }

        const data = await response.json();
        console.log('Secret successfully posted');
        return data;
    } catch (error) {
        console.error('Error posting secret:', error.message);
        throw new Error('Failed to save secret. ' + error.message);
    }
};

//get all secrets for a user identified by its email
export const getSecretsforUser = async (loginValues) => {
    try {
        const response = await fetch(`${getApiUrl()}/secrets/byemail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginValues.email,
                encryptPassword: loginValues.password
            })
        });

        //404: user has no secrets (yet)
        if (response.status === 404) {
            return [];
        }
        if (!response.ok) {
            throw new Error(await readError(response));
        }
        const data = await response.json();
        console.log('Secrets successfully got');
        return data;
    } catch (error) {
        console.error('Failed to get secrets:', error.message);
        throw new Error('Failed to get secrets. ' + error.message);
    }
};

//update (edit) an existing secret
export const putSecret = async ({secretId, loginValues, content}) => {
    try {
        const response = await fetch(`${getApiUrl()}/secrets/${secretId}`, {
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
            throw new Error(await readError(response));
        }
        const data = await response.json();
        console.log('Secret successfully updated');
        return data;
    } catch (error) {
        console.error('Error updating secret:', error.message);
        throw new Error('Failed to update secret. ' + error.message);
    }
};

//delete a secret
export const deleteSecret = async (secretId) => {
    try {
        const response = await fetch(`${getApiUrl()}/secrets/${secretId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(await readError(response));
        }
        console.log('Secret successfully deleted');
        return await response.text();
    } catch (error) {
        console.error('Error deleting secret:', error.message);
        throw new Error('Failed to delete secret. ' + error.message);
    }
};