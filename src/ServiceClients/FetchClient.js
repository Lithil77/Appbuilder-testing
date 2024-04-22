const FetchClient = {
    async get(url) {
        return await fetch(url);
    },
    async post(url, body) {
        return await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json",
            }
        });
    },
    async delete(url) {
        return await fetch(url, {
            method: 'DELETE',
        });
    },
}
export default FetchClient;
