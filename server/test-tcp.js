import net from 'net';
import tls from 'tls';

const host = 'ep-quiet-snow-ah06yky8-pooler.c-3.us-east-1.aws.neon.tech';
const port = 5432;

console.log(`Connecting to ${host}:${port}...`);

const socket = tls.connect(port, host, { minVersion: 'TLSv1.2', rejectUnauthorized: false }, () => {
    console.log('✅ TCP/TLS Connection successful!');
    socket.end();
});

socket.on('error', (err) => {
    console.error('❌ Connection error:', err.message);
});
