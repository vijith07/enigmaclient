// send a reqeust to the server to send verification email
const APIURL = "https://enigmaserver.vijith.dev"
export const sendVerificationEmail = async () => {
    // get the token from the session storage
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${APIURL}/users/send-verification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    if (response.ok) {
        return response.json();
    }
    throw new Error((await response.json()).message);
};

// send a reqeust to the server to verify the link
export const verifyEmail = async (token: string) => {
    const req = {
        token: token,
    };
    const response = await fetch(`${APIURL}/users/verify-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
    });
    // if the response is ok, return the response
    if (response.ok) {
        return response.json();
    }
    // if the response is not ok, throw an error with the message from the server
    throw new Error((await response.json()).message);
};
