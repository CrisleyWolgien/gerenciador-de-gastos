import { useEffect, useState } from "react";
import Navbar from "./navbar";

function Layout() {
  return (
    <>
      <div className="bg-dark-background w-screen h-screen">
        <div><Navbar/></div>
      </div>
    </>
  );
}

export default Layout;
