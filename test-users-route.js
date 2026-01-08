import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

async function testUsersRoute() {
    try {
        console.log(`Testing GET ${API_URL}/usuarios...`);
        const response = await axios.get(`${API_URL}/usuarios`);
        console.log('✅ Success! Status:', response.status);
        console.log('📦 Data received:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testUsersRoute();
