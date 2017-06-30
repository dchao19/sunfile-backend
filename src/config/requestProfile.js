import unirest from 'unirest';
import {getUserProfile} from './authURLS';

let requestProfile = (token) => {
    return new Promise((resolve) => {
        let request = unirest.post(getUserProfile);
        request.send({
            id_token: token // eslint-disable-line
        });
        request.end((response) => {
            resolve(response.body);
        });
    });
};

export {requestProfile};
