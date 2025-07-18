import { useState } from 'react';
import { useRouter } from 'next/router';
import { ProfileData } from '@/utils/types';

export default function Type2Home({ profileData }:{profileData:ProfileData}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                The Financialist - Type 2 Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, Type 2 User!
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Information
                </h3>
                <div className="text-left">
                  <p className="text-sm text-gray-600 mb-2">
                    Server Response:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded text-sm font-mono">
                    {JSON.stringify(profileData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context:any) {
  const { req } = context;
  
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    const response = await fetch('http://localhost:3001/profile', {
      method: 'GET',
      headers: {
        'Cookie': `auth_token=${token}`,
      },
    });

    if (!response.ok) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const profileData = await response.json();
    console.log(profileData,'PROFILE DATA HERE')

    return {
      props: {
        profileData,
      },
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}