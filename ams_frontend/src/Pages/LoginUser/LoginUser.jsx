import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../Features/auth/authSlice";
import loginImage from "../../assets/login.jpg";

const LoginUser = () => {
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUser] = useState({ email: "", password: "" });
  const [errMsg, setErrMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user.email, user.password]);

  const validateEmail = (email) => {
    const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUser((prevData) => ({ ...prevData, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!user.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(user.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!user.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (!validatePassword(user.password)) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(
        loginUser({ email: user.email, password: user.password })
      );

      if (result.meta.requestStatus === "fulfilled") {
        navigate("/dashboard", { replace: true });
      } else if (result.meta.requestStatus === "rejected") {
        // Handle the error object properly
        const errorMessage =
          result.payload?.message || result.error?.message || "Login failed";
        setErrMsg(errorMessage);
      }
    } catch (err) {
      // Handle unexpected errors
      setErrMsg("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="overflow-hidden h-screen flex justify-center items-center bg-[#e4eaed] p-4 relative">
      {/* Full Page Loader */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="loader"></div>
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full sm:w-[74%] max-w-[950px] h-auto lg:h-[80vh] bg-white border border-gray-300 rounded-lg shadow-md">
        {/* Image Section */}
        <div className="hidden md:flex w-1/2 justify-center items-center">
          <img
            src={loginImage}
            alt="Login"
            className="max-w-full p-4 h-auto rounded-lg"
          />
        </div>

        {/* Login Form */}
        <div className="w-full md:w-1/2 p-6 md:p-5 lg:p-9 flex flex-col justify-center">
          <h2 className="mb-4 md:mb-2 lg:mb-5 text-gray-600 text-xl">
            Sign In
          </h2>
          <p className="mb-4 md:mb-2 lg:mb-5 text-gray-500 text-sm -mt-2">
            Enter your email and password to access your account.
          </p>

          {(errMsg || error) && (
            <p ref={errRef} className="text-red-500 text-sm mb-3">
              {typeof (errMsg || error) === "object"
                ? (errMsg || error).message || "Login failed"
                : errMsg || error}
            </p>
          )}

          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              className="mb-2 md:mb-1 lg:mb-3 font-bold text-gray-600 text-sm"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={changeHandler}
              ref={userRef}
              className={`p-2 border ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              } rounded-md outline-none w-full text-sm placeholder-gray-500 mb-1`}
              placeholder="Enter Your Email"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mb-3 -mt-1">
                {fieldErrors.email}
              </p>
            )}

            <label
              htmlFor="password"
              className="mb-2 md:mb-1 lg:mb-3 font-bold text-gray-600 text-sm"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={user.password}
              onChange={changeHandler}
              className={`p-2 border ${
                fieldErrors.password ? "border-red-500" : "border-gray-300"
              } rounded-md outline-none w-full text-sm placeholder-gray-500 mb-1`}
              placeholder="Enter Your Password"
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mb-3 -mt-1">
                {fieldErrors.password}
              </p>
            )}

            <button
              type="submit"
              className="p-2 bg-[#d8f2f3] text-[#3bc0c3] border-none rounded-md text-sm cursor-pointer w-full hover:bg-[#3bc0c3] hover:text-white mt-4"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        </div>
      </div>

      {/* Loader CSS */}
      <style>
        {`
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid #ffffff;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginUser;
