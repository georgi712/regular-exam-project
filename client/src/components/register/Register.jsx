import { useActionState, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/userContext.js';
import { useRegister } from '../../api/authApi.js';
import { useToastContext } from '../../contexts/ToastContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useRegister();
  const toast = useToastContext();

  const registerHandler = async (previousState, formData) => {
    const values = Object.fromEntries(formData);
    const username = values.firstName + ' ' + values.lastName;

    // Password validation
    if (values.password.length < 4) {
      toast.error('Password must be at least 4 characters long!');
      return values;
    }

    if (values.password !== values.rePass) {
      toast.error('Passwords do not match!');
      return values;
    }

    setIsLoading(true);
    
    // Show a loading toast that we'll dismiss on completion
    const loadingToastId = toast.info('Creating your account...', 10000);
    
    try {
      const result = await register(values.email, values.password, username);
      
      // Remove the loading toast
      toast.removeToast(loadingToastId);
      
      if (result.success) {
        toast.success(`Welcome, ${values.firstName}! Your account has been created.`);
        navigate('/');
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      // Remove the loading toast
      toast.removeToast(loadingToastId);
      
      toast.error(err.message || 'An unexpected error occurred. Please try again.');
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