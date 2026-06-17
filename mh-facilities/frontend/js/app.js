document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const loginResult = document.getElementById('login-result');
    const registerForm = document.getElementById('register-form');
    const registerResult = document.getElementById('register-result');
    const registrationSuccess = document.getElementById('registration-success');

    if (loginForm && loginResult) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value.trim();
            const apiUrl = '/auth/login';

            loginResult.textContent = 'Enviando...';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, senha })
                });

                const text = await response.text();
                loginResult.textContent = text;
                loginResult.style.color = response.ok ? '#16a34a' : '#dc2626';
            } catch (error) {
                loginResult.textContent = 'Não foi possível conectar ao servidor.';
                loginResult.style.color = '#dc2626';
            }
        });
    }

    if (registerForm && registerResult) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email-register').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const senha = document.getElementById('senha-register').value.trim();
            const apiUrl = '/auth/register';

            registerResult.textContent = 'Enviando...';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome, email, telefone, senha })
                });

                const text = await response.text();
                registerResult.textContent = text;
                registerResult.style.color = response.ok ? '#16a34a' : '#dc2626';

                if (response.ok && registrationSuccess) {
                    registrationSuccess.classList.remove('hidden');
                    registerForm.reset();
                }
            } catch (error) {
                registerResult.textContent = 'Não foi possível conectar ao servidor.';
                registerResult.style.color = '#dc2626';
            }
        });
    }
});
