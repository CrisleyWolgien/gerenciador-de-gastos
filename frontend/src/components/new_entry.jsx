import { useEffect, useState } from "react";

function New_entry() {
  const [inputname, setInputName] = useState("");
  const [inputdiscription, setInputDiscription] = useState("");
  const [inputvalue, setInputValue] = useState("");
  const [InputCategory, setInputCategory] = useState("");
  const [respostaAPI, setRespostApi] = useState("");

  const create_entry = (e) => {
    e.preventDefault();

    fetch("https://gerenciador-de-gastos-42k3.onrender.com/expenses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: JSON.stringify({
        name: inputname,
        discription: inputdiscription,
        category: InputCategory,
        value: inputvalue,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "erro desconhecido");
        }
        if (res.status === 401) {
          localStorage.removeItem("token");
        }

        return data;
      })
      .then((data) => setRespostApi(data.message))
      .catch((error) => {
        console.error("error", error);
        setRespostApi(error.message);
      });
  };
  return (
    <>
      <div className="h-full w-full p-4 md:p-8 static-grid-bg">
        <div className="text-center py-4">
          <h1 className="text-3xl md:text-4xl font-display text-text-primary tracking-widest animate-glitch">
            NEW ENTRY
          </h1>
        </div>

        <div className="mt-2 flex items-center justify-center w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid w-[50%]">
            <div className="text-center sm:text-left w-full">
              <div className="flex flex-col ">
                <form onSubmit={create_entry} className="">
                  <div className="font-mono text-text-secondary uppercase ">
                    <p className="ml-1 mb-1 text-2xl">NAME</p>
                    <input
                      type="text"
                      required
                      value={inputname}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="Insira o nome da transação"
                      className="w-full pl-10 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
                    />
                  </div>

                  <div className="font-mono text-text-secondary uppercase w-full mt-5">
                    <p className="ml-1 mb-1 text-2xl">DISCRIPTION</p>
                    <input
                      type="text"
                      required
                      value={inputdiscription}
                      onChange={(e) => setInputDiscription(e.target.value)}
                      placeholder="Insira a descrição da transação"
                      className="w-full pl-10 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
                    />
                  </div>

                  <div className="font-mono text-text-secondary uppercase w-full mt-5">
                    <p className="ml-1 mb-1 text-2xl">CATEGORY</p>
                    <select
                      name=""
                      required
                      id=""
                      value={InputCategory}
                      onChange={(e) => setInputCategory(e.target.value)}
                      className="w-full pl-10 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
                    >
                      <option value="teste">teste</option>
                      <option value="teste2">teste2</option>
                    </select>
                  </div>

                  <div className="font-mono text-text-secondary uppercase w-full mt-5">
                    <p className="ml-1 mb-1 text-2xl">VALUE</p>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={inputvalue}
                      onChange={(e) => setInputValue(e.target.value)}
                      required
                      className="w-full pl-10 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
                    />
                  </div>
                  <div>
                    <button className="font-display text-dark-panel tracking-widest animate-glitch  border-2 rounded-[4px] p-2 px-5 m-4 bg-electric-green hover:shadow-electric-glow">
                      COMMIT
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default New_entry;
