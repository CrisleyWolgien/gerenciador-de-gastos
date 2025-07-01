import { use, useState } from "react";

function LoginPage() {
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

  // logica login

  const [inputemail, setInputEmail] = useState("");
  const [inputpassword, setInputPassword] = useState("");
  const [respostaApi, setRespostaApi] = useState("");

  const loginUser = (e) => {
    e.preventDefault();

    fetch("https://gerenciador-de-gastos-42k3.onrender.com/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: inputemail,
        password: inputpassword,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "erro desconhecido");
        }
        localStorage.setItem("token", data.access_token);
        return data;
      })

      .then((data) => setRespostaApi(data.message))
      .catch((error) => {
        console.error("error", error);
        setRespostaApi(error.message);
      });
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-dark-background p-4">
      <div className="bg-dark-surface/80 backdrop-blur-sm border border-neon-cyan/50 shadow-glow-cyan w-[90%] md:w-[70%] lg:w-[50%] max-w-2xl h-auto rounded-2xl p-5 lg:p-10">
        <div className="flex flex-col gap-5 items-center w-full h-full">
          <h1 className="text-4xl md:text-5xl font-bold text-neon-pink font-display">
            Login
          </h1>

          <div className="w-full lg:w-4/5 flex flex-col items-center justify-center">
            <form
              onSubmit={loginUser}
              className="w-full flex flex-col items-center justify-center gap-2"
            >
              <div className="w-full">
                <p className="mb-2 mt-5 text-text-secondary font-body">
                  E-mail
                </p>
                <input
                  type="email"
                  placeholder="Digite seu E-mail"
                  value={inputemail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full pl-2 p-2 rounded-[10px] text-text-primary bg-transparent border-2 border-text-secondary focus:border-neon-pink focus:outline-none focus:ring-1 focus:ring-neon-pink"
                />
              </div>
              <div className="w-full">
                <p className="mb-2 mt-5 text-text-secondary font-body">Senha</p>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={inputpassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full pl-2 p-2 rounded-[10px] text-text-primary bg-transparent border-2 border-text-secondary focus:border-neon-pink focus:outline-none focus:ring-1 focus:ring-neon-pink"
                  />
                  <button
                    onClick={toggleSeePassword}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-neon-pink"
                  >
                    {showPassword ? eyeClose : eyeOpen}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-around w-full mt-10 gap-4">
                <button className="w-full sm:w-auto font-bold text-neon-cyan border-2 border-neon-cyan p-2 px-5 rounded-xl transition-all duration-300 hover:bg-neon-cyan hover:text-dark-background hover:shadow-glow-cyan font-body">
                  Entrar
                </button>
                <button className="w-full sm:w-auto font-bold text-neon-pink border-2 border-neon-pink p-2 px-5 rounded-xl transition-all duration-300 hover:bg-neon-pink hover:text-dark-background hover:shadow-glow-pink font-body">
                  Registrar-se
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
