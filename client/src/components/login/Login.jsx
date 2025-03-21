import { useActionState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../api/authApi.js';
import { UserContext } from '../../contexts/userContext.js';

export default function Login() {

  const navigate = useNavigate();
  const {userLoginHandler} = useContext(UserContext);
  const { login } = useLogin();

  const loginHandler = async (previousState, formData) => {
    const values = Object.fromEntries(formData);

    const authData  = await login(values.email, values.password);

    userLoginHandler(authData);
    navigate('/');
    return values
  }

  const [values, loginAction, isPending] = useActionState(loginHandler, {email: '', password: ''})

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
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                  <Link to="/forgot-password" className="label-text-alt link link-hover">
                    Forgot password?
                  </Link>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <input className="btn btn-primary w-full" type="submit" value="Sign in" disabled={isPending} ></input>

              <div className="divider">OR</div>

              <div className="space-y-3">
                <button className="btn btn-outline w-full">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
                <button className="btn btn-outline w-full">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  Continue with Facebook
                </button>
              </div>

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