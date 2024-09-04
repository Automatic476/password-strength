async function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const feedback = document.getElementById('feedback');

    // Regular expressions for different password criteria
    const lengthCriteria = /.{8,}/; // At least 8 characters
    const lowercaseCriteria = /[a-z]/;
    const uppercaseCriteria = /[A-Z]/;
    const numberCriteria = /[0-9]/;
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/;

    let strength = 0;

    // Check the criteria
    if (lengthCriteria.test(password)) strength++;
    if (lowercaseCriteria.test(password)) strength++;
    if (uppercaseCriteria.test(password)) strength++;
    if (numberCriteria.test(password)) strength++;
    if (specialCharCriteria.test(password)) strength++;

    // Update the progress bar based on the strength score
    updateProgressBar(strength);

    // Provide feedback based on the strength score
    switch (strength) {
        case 0:
        case 1:
            feedback.textContent = 'Very Weak';
            feedback.style.color = 'red';
            break;
        case 2:
            feedback.textContent = 'Weak';
            feedback.style.color = 'orange';
            break;
        case 3:
            feedback.textContent = 'Moderate';
            feedback.style.color = 'yellow';
            break;
        case 4:
            feedback.textContent = 'Strong';
            feedback.style.color = 'green';
            break;
        case 5:
            feedback.textContent = 'Very Strong';
            feedback.style.color = 'darkgreen';
            break;
        default:
            feedback.textContent = '';
    }

    // Check the password against the Have I Been Pwned API
    if (password) {
        const pwnedCount = await checkPasswordBreach(password);
        if (pwnedCount > 0) {
            feedback.textContent += ` - Warning: This password has been exposed ${pwnedCount} times in data breaches!`;
            feedback.style.color = 'red';
        }
    }
}

async function checkPasswordBreach(password) {
    // Hash the password using SHA-1
    const sha1Hash = new TextEncoder().encode(password);
    const hashArray = await crypto.subtle.digest('SHA-1', sha1Hash);
    const hashHex = Array.from(new Uint8Array(hashArray))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();

    const hashPrefix = hashHex.slice(0, 5);
    const hashSuffix = hashHex.slice(5);

    // Fetch the list of hashes that match the prefix
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
    const data = await response.text();

    // Check if the hash suffix is found in the returned data
    const matches = data.split('\n').map(line => line.split(':'));
    const match = matches.find(([suffix, count]) => suffix === hashSuffix);

    return match ? parseInt(match[1], 10) : 0;
}

function updateProgressBar(strength) {
    const progressBar = document.getElementById('progress-bar');

    switch (strength) {
        case 0:
        case 1:
            progressBar.style.setProperty('--progress-color', 'red');
            progressBar.style.setProperty('width', '20%');
            break;
        case 2:
            progressBar.style.setProperty('--progress-color', 'orange');
            progressBar.style.setProperty('width', '40%');
            break;
        case 3:
            progressBar.style.setProperty('--progress-color', 'yellow');
            progressBar.style.setProperty('width', '60%');
            break;
        case 4:
            progressBar.style.setProperty('--progress-color', 'green');
            progressBar.style.setProperty('width', '80%');
            break;
        case 5:
            progressBar.style.setProperty('--progress-color', 'darkgreen');
            progressBar.style.setProperty('width', '100%');
            break;
        default:
            progressBar.style.setProperty('--progress-color', 'transparent');
            progressBar.style.setProperty('width', '0%');
    }

    // Animate the progress bar
    progressBar.querySelector('::after').style.width = progressBar.style.width;
}
