import { useActionState, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/userContext.js';
import { useRegister } from '../../api/authApi.js';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useRegister();

  const registerHandler = async (previousState, formData) => {
    const values = Object.fromEntries(formData);
    const username = values.firstName + ' ' + values.lastName;

    if (values.password !== values.rePass) {
      setError('Passwords do not match!');
      return values;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await register(values.email, values.password, username);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
    
    return values;
  }

  const [values, registerAction, isPending] = useActionState(registerHandler, { firstName: '', lastName: '', email: '', password: '', rePass: '' })

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base-100">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Create Your Account</h1>
          <p className="text-base-content/70">
            Join our community and start shopping for fresh and healthy products.
          </p>
        </div>

        <div className="card bg-base-100 border border-base-200">
          <div className="card-body">
            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}
            
            <form className="space-y-6" action={registerAction}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">First Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    name="firstName"
                    className="input input-bordered w-full"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Last Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    name="lastName"
                    className="input input-bordered w-full"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  name="email"
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
                  placeholder="••••••••"
                  name="password"
                  className="input input-bordered w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  name="rePass"
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
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>

              <div className="divider"></div>

              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="link link-hover text-accent">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 