import { simulateRequest, getDataset } from './index'

export const getUsers = async (variant) => {
    return simulateRequest(getDataset(variant).users);
};

export const getUserById = async (id, variant) => {
    const user = getDataset(variant).users.find((u) => u.id === Number(id)) || null;
    return simulateRequest(user);
};

export const loginByLogin = async (login, variant) => {
    const user = getDataset(variant).users.find(
        (u) => u.login.toLowerCase() === String(login).trim().toLowerCase()
    );
    if (!user) {
        throw new Error('Пользователь с таким логином не найден');
    }
    return simulateRequest(user);
};
