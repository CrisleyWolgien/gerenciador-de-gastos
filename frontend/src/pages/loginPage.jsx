import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

function LoginPage() {
  const navigate = useNavigate();
  const eyeOpen = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
      width="20"
      height="20"
      fill="currentColor"
    >
      <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
    </svg>
  );
  const eyeClose = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 512"
      width="20"
      height="20"
      fill="currentColor"
    >
      <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" />
    </svg>
  );

  const [showPassword, setShowPassword] = useState(false);
  const toggleSeePassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  const [inputemail, setInputEmail] = useState("");
  const [inputpassword, setInputPassword] = useState("");
  const [respostaApi, setRespostaApi] = useState("");

  const loginUser = (e) => {
    e.preventDefault();
    fetch("https://gerenciador-de-gastos-42k3.onrender.com/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: inputemail, password: inputpassword }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Email ou senha incorreta");
        localStorage.setItem("token", data.acess_token);
        navigate("/dashboard");
      })
      .catch((error) => {
        setRespostaApi(error.message);
      });
  };

  return (
    // Contêiner principal para posicionar o fundo e o card
    <div className="relative h-screen w-screen flex justify-center items-center overflow-hidden">
      {/* MUDANÇA: Adicionado um fundo com padrão de grid */}
      <div
        className="absolute inset-0 z-0 h-full w-full animated-grid-bg"
        style={{ backgroundSize: "70px 70px" }} // Ajuste o tamanho do grid aqui se desejar
      ></div>

      {/* Card de Login (agora com z-10 para ficar na frente do fundo) */}
      <div className="relative z-10 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid w-[95%] sm:w-4/5 md:w-3/5 lg:w-2/5 max-w-md rounded-none shadow-lg shadow-black/50">
        <div className="p-4 border-b border-dark-grid">
          <h1 className="text-3xl font-display text-text-primary text-center tracking-widest animate-glitch">
            AUTHENTICATION
          </h1>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={loginUser} className="w-full flex flex-col gap-6">
            <div className="w-full">
              <label className="font-mono text-sm text-text-secondary">
                EMAIL_ADDRESS:
              </label>
              <input
                type="email"
                value={inputemail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full mt-2 p-3 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
                required
              />
            </div>

            <div className="w-full">
              <label className="font-mono text-sm text-text-secondary">
                PASSWORD_KEY:
              </label>
              <div className="relative w-full mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={inputpassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full p-3 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
                  required
                />
                <button
                  onClick={toggleSeePassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary hover:text-electric-green"
                >
                  {showPassword ? eyeClose : eyeOpen}
                </button>
              </div>
            </div>

            {respostaApi && (
              <div className="text-center font-mono text-error p-2 bg-error/10 border border-error/50">
                {respostaApi}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 p-3 font-display font-bold text-lg bg-electric-green text-dark-panel hover:shadow-electric-glow transition-all duration-300"
              >
                <FiLogIn />
                <span>ACCESS</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="w-full flex items-center justify-center gap-2 p-3 font-display font-bold text-lg border-2 border-dark-grid text-text-secondary hover:border-data-blue hover:text-data-blue transition-colors duration-300"
              >
                <FiUserPlus />
                <span>REGISTER</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
