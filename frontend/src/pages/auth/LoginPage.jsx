import React from 'react'; 

const LoginPage = () => { 
  return ( 
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50"> 
      <h1 className="text-3xl font-bold mb-8">Login</h1> 
      <form> 
        <div className="mb-4"> 
          <label htmlFor="email" className="block text-sm font-medium text-gray-700"> 
            Email 
          </label> 
          <input 
            type="email" 
            id="email" 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            placeholder="Enter your email" 
          /> 
        </div> 
        <div className="mb-6"> 
          <label htmlFor="password" className="block text-sm font-medium text-gray-700"> 
            Password 
          </label> 
          <input 
            type="password" 
            id="password" 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            placeholder="Enter your password" 
          /> 
        </div> 
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
        > 
          Login 
        </button> 
      </form> 
    </div> 
  ); 
}; 

export default LoginPage;