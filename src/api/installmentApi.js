import api from "./api";

const BASE_URL = "/installment"

export async function getPlans(token) {
    const res = await api.get(`${BASE_URL}/plans`);
    //console.log(res.data);
    return res.data;
}


export async function precheckApplication(data) {
    const res = await api.post(`${BASE_URL}/applications/precheck`, data);
    return res.data;
}

export async function createApplication(data) {
    const res = await api.post(`${BASE_URL}/applications`, data);
    return res.data;
}