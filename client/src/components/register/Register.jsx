import { useActionState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/userContext.js';
import { useRegister } from '../../api/authApi.js';

export default function Register() {
  const navigate = useNavigate();
  const {userLoginHandler} = useContext(UserContext);
  const { register } = useRegister();

  const registerHandler = async (previousState, formData) => {
    const values = Object.fromEntries(formData);
    const username = values.firstName + ' ' + values.lastName;

    if (values.password !== values.rePass) {
      console.error('Password mismatch!');

      return;
    }

    const authData = await register(values.email, values.password, username);
    userLoginHandler(authData);
    navigate('/');
    return values
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
                />
              </div>

              {/* <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-medium">
                    I agree to the{' '}
                    <Link to="/terms" className="link link-hover text-accent">
                      Terms and Conditions
                    </Link>
                  </span>
                  <input type="checkbox" className="checkbox checkbox-accent" required />
                </label>
              </div> */}

              <input className="btn btn-primary w-full" type="submit" value="Create Account" disabled={isPending}></input>

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