import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Header from '../components/Header';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const logError = async (message: string) => {
    try {
      const { error: logError } = await supabase
        .from('debug_logs')
        .insert([{ message }]);
      
      if (logError) {
        console.error('Failed to log error:', logError);
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await logError(`Attempting password reset for email: ${email}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        await logError(`Password reset failed for ${email}: ${error.message}`);
        setError(error.message);
        return;
      }

      await logError(`Password reset email sent successfully to ${email}`);
      setIsSuccess(true);
      toast.success('Password reset email sent');
    } catch (err) {
      const errorMessage = `Unexpected error during password reset for ${email}: ${err instanceof Error ? err.message : 'Unknown error'}`;
      await logError(errorMessage);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {isSuccess ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Check your email for the password reset link.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="flex items-center text-sm font-medium text-green-800 hover:text-green-700"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending reset link...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <KeyRound className="h-4 w-4 mr-2" />
                      Send reset link
                    </span>
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}