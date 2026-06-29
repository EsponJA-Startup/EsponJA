import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  
  const navigate = useNavigate();
  
  
  const [status, setStatus] = useState('loading');

  useEffect(() => {

    if (!token) {
      setStatus('error');
      return;
    }


    const verifyToken = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          setStatus('success');

          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };


    verifyToken();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md w-full">

        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Verificando seu e-mail...</h2>
          </>
        )}
        

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2">E-mail verificado!</h2>
            <p className="text-gray-600">Sua conta foi ativada. Redirecionando para o login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-semibold mb-2">Link inválido ou expirado</h2>
            <p className="text-gray-600 mb-4">O link que você acessou não é válido ou já foi utilizado.</p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ir para Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}