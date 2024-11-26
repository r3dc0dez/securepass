// DOM Elements
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const generateBtn = document.getElementById('generateBtn');
const passwordLength = document.getElementById('passwordLength');
const lengthValue = document.getElementById('lengthValue');
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');
const savePasswordBtn = document.getElementById('savePassword');
const serviceNameInput = document.getElementById('serviceName');
const usernameInput = document.getElementById('username');
const storedPasswordsDiv = document.querySelector('.stored-passwords');
const themeToggle = document.getElementById('themeToggle');
const addNewBtn = document.getElementById('addNewBtn');
const savePasswordForm = document.querySelector('.save-password-form');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');
const navLinks = document.querySelectorAll('.nav-links li');
const tabContents = document.querySelectorAll('.tab-content');
const searchVault = document.getElementById('searchVault');
const totalPasswordsSpan = document.getElementById('totalPasswords');
const toggleOptionsBtn = document.getElementById('toggleOptions');
const optionsPanel = document.querySelector('.options-panel');
const generateForVaultBtn = document.getElementById('generateForVault');
const vaultPasswordInput = document.getElementById('vaultPasswordInput');

// Character sets
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Theme handling
themeToggle.addEventListener('change', () => {
    document.documentElement.setAttribute(
        'data-theme',
        themeToggle.checked ? 'dark' : 'light'
    );
    localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'dark';

// Tab switching
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const tabId = link.getAttribute('data-tab');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// Password length slider
passwordLength.addEventListener('input', () => {
    lengthValue.textContent = passwordLength.value;
    // Update slider background
    const value = (passwordLength.value - passwordLength.min) / (passwordLength.max - passwordLength.min) * 100;
    passwordLength.style.background = `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${value}%, var(--border-color) ${value}%, var(--border-color) 100%)`;
});

// Initialize slider background
const initialValue = (passwordLength.value - passwordLength.min) / (passwordLength.max - passwordLength.min) * 100;
passwordLength.style.background = `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${initialValue}%, var(--border-color) ${initialValue}%, var(--border-color) 100%)`;

// Generate password
function generatePassword() {
    let chars = '';
    let password = '';

    if (uppercaseCheck.checked) chars += uppercase;
    if (lowercaseCheck.checked) chars += lowercase;
    if (numbersCheck.checked) chars += numbers;
    if (symbolsCheck.checked) chars += symbols;

    if (!chars) {
        showToast('Please select at least one character type!', 'error');
        return;
    }

    const length = parseInt(passwordLength.value);
    if (length < 8 || length > 32) {
        showToast('Password length must be between 8 and 32 characters!', 'error');
        return;
    }

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    passwordOutput.value = password;
    updateStrengthMeter(password);
    return password;
}

// Update strength meter
function updateStrengthMeter(password) {
    const strength = calculatePasswordStrength(password);
    let width = '0%';
    let color = '#ff4444';
    let text = 'Weak';

    if (strength > 80) {
        width = '100%';
        color = '#00C851';
        text = 'Strong';
    } else if (strength > 60) {
        width = '75%';
        color = '#00C851';
        text = 'Good';
    } else if (strength > 40) {
        width = '50%';
        color = '#ffbb33';
        text = 'Moderate';
    } else if (strength > 20) {
        width = '25%';
        color = '#ff4444';
        text = 'Weak';
    }

    strengthBar.style.width = width;
    strengthBar.style.background = color;
    strengthText.textContent = `Password Strength: ${text}`;
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length contribution
    strength += Math.min(password.length * 4, 25);

    // Character variety contribution
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    // Complexity bonus
    const uniqueChars = new Set(password).size;
    strength += Math.min(uniqueChars * 2, 15);

    return Math.min(strength, 100);
}

// Copy password to clipboard
async function copyToClipboard() {
    if (!passwordOutput.value) {
        showToast('Generate a password first!', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(passwordOutput.value);
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        showToast('Password copied to clipboard!', 'success');
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 1500);
    } catch (err) {
        showToast('Failed to copy password!', 'error');
    }
}

// Save password to vault
function savePassword() {
    const service = serviceNameInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordOutput.value;

    if (!service || !username || !password) {
        showToast('Please fill in all fields and generate a password!', 'error');
        return;
    }

    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    const newEntry = {
        id: Date.now(),
        service,
        username,
        password
    };

    vault.push(newEntry);
    localStorage.setItem('passwordVault', JSON.stringify(vault));

    serviceNameInput.value = '';
    usernameInput.value = '';
    passwordOutput.value = '';
    savePasswordForm.classList.add('hidden');
    
    showToast('Password saved successfully!', 'success');
    displayPasswords();
}

// Display stored passwords
function displayPasswords() {
    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    
    if (vault.length === 0) {
        storedPasswordsDiv.innerHTML = `
            <div class="empty-vault">
                <i class="fas fa-lock"></i>
                <p>Your vault is empty</p>
                <button onclick="addNewBtn.click()" class="secondary-btn">
                    <i class="fas fa-plus"></i> Add Your First Password
                </button>
            </div>
        `;
    } else {
        displayFilteredPasswords(vault);
    }
    
    updateTotalPasswords();
}

// Search functionality
searchVault.addEventListener('input', () => {
    const searchTerm = searchVault.value.toLowerCase();
    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    
    const filteredVault = vault.filter(entry => 
        entry.service.toLowerCase().includes(searchTerm) ||
        entry.username.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredPasswords(filteredVault);
});

function displayFilteredPasswords(passwords) {
    storedPasswordsDiv.innerHTML = '';
    
    if (passwords.length === 0) {
        storedPasswordsDiv.innerHTML = `
            <div class="empty-vault">
                <i class="fas fa-search"></i>
                <p>No passwords match your search</p>
            </div>
        `;
        return;
    }
    
    passwords.forEach(entry => {
        const passwordItem = document.createElement('div');
        passwordItem.className = 'password-item';
        passwordItem.innerHTML = `
            <div class="password-info">
                <strong>${entry.service}</strong>
                <span class="text-secondary">Username: ${entry.username}</span>
                <span class="text-secondary">Password: ${'•'.repeat(12)}</span>
            </div>
            <div class="password-actions">
                <button onclick="copyPasswordFromVault(${entry.id})" class="icon-btn" title="Copy password">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="deletePassword(${entry.id})" class="icon-btn" title="Delete" style="background-color: var(--danger-color)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        storedPasswordsDiv.appendChild(passwordItem);
    });
}

// Update total passwords count
function updateTotalPasswords() {
    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    totalPasswordsSpan.textContent = `${vault.length} password${vault.length !== 1 ? 's' : ''} stored`;
}

// Copy password from vault
async function copyPasswordFromVault(id) {
    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    const entry = vault.find(e => e.id === id);
    
    if (entry) {
        try {
            await navigator.clipboard.writeText(entry.password);
            showToast('Password copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy password!', 'error');
        }
    }
}

// Delete password from vault
function deletePassword(id) {
    if (!confirm('Are you sure you want to delete this password?')) return;

    const vault = JSON.parse(localStorage.getItem('passwordVault') || '[]');
    const updatedVault = vault.filter(entry => entry.id !== id);
    localStorage.setItem('passwordVault', JSON.stringify(updatedVault));
    
    showToast('Password deleted successfully!', 'success');
    displayPasswords();
}

// Show/hide password form
addNewBtn.addEventListener('click', () => {
    savePasswordForm.classList.toggle('hidden');
});

// Options toggle
toggleOptionsBtn.addEventListener('click', () => {
    optionsPanel.classList.toggle('show');
    const isExpanded = optionsPanel.classList.contains('show');
    toggleOptionsBtn.innerHTML = isExpanded ? 
        '<i class="fas fa-times"></i> Close' : 
        '<i class="fas fa-cog"></i> Options';
});

// Generate for vault
generateForVaultBtn.addEventListener('click', () => {
    const password = generatePassword();
    vaultPasswordInput.value = password;
    showToast('Password generated!', 'success');
});

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    const color = type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--accent-color)';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}" style="color: ${color}"></i>
        <span>${message}</span>
    `;
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event listeners
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);
savePasswordBtn.addEventListener('click', savePassword);

// Initial display of stored passwords
displayPasswords();
