const { exec } = require('child_process');
require('dotenv').config('./.env');

const url = 'http://localhost:4000/login';

console.log(`Generating code for ${url}`);
exec(`npx playwright codegen ${url}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
