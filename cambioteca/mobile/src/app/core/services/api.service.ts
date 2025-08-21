import axios from 'axios';
import { environment } from '../../../environments/environment';

const api = axios.create({ baseURL: environment.apiUrl });
// Por ahora sin token (el listado de libros será público).
export default api;
