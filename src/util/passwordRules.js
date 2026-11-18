/**
 * Rules for a strong password.
 * The same rules are checked in the backend (PasswordValidator.java).
 * @author Peter Rutschmann
 */
export const PASSWORD_RULES = [
    {text: '8 to 30 characters', test: (pw) => pw.length >= 8 && pw.length <= 30},
    {text: 'one lowercase letter', test: (pw) => /[a-z]/.test(pw)},
    {text: 'one uppercase letter', test: (pw) => /[A-Z]/.test(pw)},
    {text: 'one digit', test: (pw) => /\d/.test(pw)},
    {text: 'one special character (@#$%^&+=!?*._-)', test: (pw) => /[@#$%^&+=!?*._-]/.test(pw)},
    {text: 'no spaces', test: (pw) => !/\s/.test(pw)},
];

//calculates how strong a password is: every fulfilled rule counts
export function getPasswordStrength(password) {
    const pw = password || '';

    const results = PASSWORD_RULES.map(rule => ({
        text: rule.text,
        ok: pw.length > 0 && rule.test(pw)
    }));
    const passed = results.filter(result => result.ok).length;
    const percent = Math.round((passed / PASSWORD_RULES.length) * 100);
    const isStrong = passed === PASSWORD_RULES.length;

    let label = 'weak';
    let color = '#c0392b';
    if (isStrong) {
        label = 'strong';
        color = '#2e8b57';
    } else if (percent >= 50) {
        label = 'medium';
        color = '#d68910';
    }

    return {results, passed, percent, label, color, isStrong};
}