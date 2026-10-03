const studentIdKey = 'currentStudentId';
const studentNameKey = 'currentStudentName';
const studentTokenKey = 'currentStudentToken';

export function getStudentSession() {
  const id = sessionStorage.getItem(studentIdKey);
  const name = sessionStorage.getItem(studentNameKey) || '';
  const token = sessionStorage.getItem(studentTokenKey);
  localStorage.removeItem(studentIdKey);
  localStorage.removeItem(studentNameKey);
  if (!id || !token) {
    clearStudentSession();
    return null;
  }

  return { id, name, token };
}

export function getCurrentStudentId() {
  return getStudentSession()?.id || null;
}

export function getCurrentStudentName() {
  return getStudentSession()?.name || '';
}

export function saveStudentSession(student) {
  if (!student?.id || !student.token) {
    throw new Error('Sign-in returned no secure session token. Restart or redeploy the backend and make sure VITE_API_URL points to that updated API.');
  }
  sessionStorage.setItem(studentIdKey, String(student.id));
  sessionStorage.setItem(studentNameKey, student.name || '');
  sessionStorage.setItem(studentTokenKey, student.token || '');
  localStorage.removeItem(studentIdKey);
  localStorage.removeItem(studentNameKey);
}

export function clearStudentSession() {
  sessionStorage.removeItem(studentIdKey);
  sessionStorage.removeItem(studentNameKey);
  sessionStorage.removeItem(studentTokenKey);
  localStorage.removeItem(studentIdKey);
  localStorage.removeItem(studentNameKey);
}