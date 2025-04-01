import { useActionState, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../api/authApi.js';
import { UserContext } from '../../contexts/userContext.js';
import { useToastContext } from '../../contexts/ToastContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useLogin();
  const toast = useToastContext();

  const loginHandler = async (_, formData) => {
    const values = Object.fromEntries(formData);
    setIsLoading(true);
    
    const loadingToastId = toast.info('Signing in...', 10000);
    
    try {
      const result = await login(values.email, values.password);
      
      toast.removeToast(loadingToastId);
      
      if (result.success) {
        if (result.warning) {
          toast.warning(result.warning);
        }
        
        toast.success('Welcome back!');
        navigate('/');
      } else {
        toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      toast.removeToast(loadingToastId);
      toast.error(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
    
    return values;
  }

  const [_, loginAction, isPending] = useActionState(loginHandler, {email: '', password: ''})

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base-100">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-base-content/70">
            Sign in to your account to continue shopping for fresh and healthy products.
          </p>
        </div>

        <div className="card bg-base-100 border border-base-200">
          <div className="card-body">
            <form className="space-y-6" action={loginAction}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="input input-bordered w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              <button 
                className="btn btn-primary w-full" 
                type="submit" 
                disabled={isPending || isLoading}
              >
                {(isPending || isLoading) ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>

              <div className="divider"></div>

              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="link link-hover text-accent">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 