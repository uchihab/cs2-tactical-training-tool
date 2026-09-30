import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rotas antigas de role (pré-taxonomia oficial). Temporário — não são mais
  // a arquitetura oficial de rotas; mantidas só para não quebrar links/testes
  // salvos. LURKER não tem rota principal equivalente (virou tactical
  // assignment — ver src/types/assignment.ts), então cai na home.
  async redirects() {
    return [
      { source: "/entry-1", destination: "/entry-fragger", permanent: false },
      { source: "/entry-2", destination: "/rifler", permanent: false },
      { source: "/support", destination: "/suporte", permanent: false },
      { source: "/awp", destination: "/awper", permanent: false },
      { source: "/ancora", destination: "/anchor", permanent: false },
      { source: "/lurker", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
