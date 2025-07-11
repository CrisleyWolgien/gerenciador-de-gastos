import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import PlexusBackground from './PlexusBackground'; // 1. Importe o novo componente

function Layout({ children }) {
  return (
    <div className="relative flex h-screen">
      {/* 2. Renderize o fundo. Ele ficará atrás de tudo por padrão. */}
      <PlexusBackground />

      {/* 3. A sidebar e o conteúdo principal precisam de um z-index para ficarem na frente. */}
      <div className="relative z-10">
        <Sidebar />
      </div>
      
      <main className="relative z-10 flex-1 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;