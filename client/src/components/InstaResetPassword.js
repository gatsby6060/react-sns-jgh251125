import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3010/instauser/instaresetpassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await res.json();
    setMessage(data.msg);
  }

  return (
    <div>
      <h2>비밀번호 재설정</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="password" 
          placeholder="새 비밀번호" 
          value={newPassword} 
          onChange={e => setNewPassword(e.target.value)} 
        />
        <button type="submit">변경</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
