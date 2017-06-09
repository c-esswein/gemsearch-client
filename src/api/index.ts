

export function processServerResp(response: any) {
    if (response['success']) {
        return response['data'];
    } else {
        alert('Error');
        console.error(response);
    }
};
