// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import styled from 'styled-components';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentAdmin } = useAdminAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentAdmin) {
      navigate('/');
    }
  }, [currentAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <LoginHeader>
          <h1>Apna Collection</h1>
          <h2>Admin Panel</h2>
        </LoginHeader>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@apnacollection.com"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </FormGroup>
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </LoginButton>
        </LoginForm>
        
        <SecurityNote>
          This is a secure admin area. Unauthorized access is prohibited.
        </SecurityNote>
      </LoginBox>
    </LoginContainer>
  );
};

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%);
  padding: 20px;
`;

const LoginBox = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  padding: 40px;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 24px;
    margin-bottom: 6px;
    color: #333;
  }
  
  h2 {
    font-size: 18px;
    font-weight: 500;
    color: #8e44ad;
  }
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 2px rgba(142, 68, 173, 0.2);
  }
`;

const LoginButton = styled.button`
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: #7d3c98;
  }
  
  &:disabled {
    background-color: #a569bd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const SecurityNote = styled.p`
  text-align: center;
  font-size: 12px;
  color: #888;
  margin-top: 20px;
`;

export default Login;