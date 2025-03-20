import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-base-200 to-base-300 text-base-content px-4">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-extrabold text-accent mb-8 animate-pulse">404</h1>
        
        <div className="mb-8 relative">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4">Oops! Page Not Found</h2>
              <p className="text-lg mb-6">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
              
              <Link to="/" className="btn btn-primary btn-lg btn-block">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 