import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'data', 'users.json');

const load = () => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    throw new Error('Error reading users.json: ' + error.message);
  }
};

const save = (users) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  } catch (error) {
    throw new Error('Error writing users.json: ' + error.message);
  }
};

export const getByEmail = (email) => {
  const users = load();
  return users.find((user) => user.email === email) || null;
};

export const create = ({ nombre, email, passwordHash, rol }) => {
  const users = load();
  const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
  const newUser = { id: maxId + 1, nombre, email, passwordHash, rol };
  users.push(newUser);
  save(users);
  return newUser;
};

export const getById = (id) => {
  const users = load();
  return users.find((user) => user.id === id) || null;
};