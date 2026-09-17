import os from 'os';

function getDevOrigins() {
  const origins = ['localhost', '127.0.0.1'];
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4') {
          origins.push(net.address);
        }
      }
    }
  } catch {}
  return origins;
}

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: getDevOrigins(),
  async rewrites() {
    return [
      {
        source: '/paper',
        destination: '/paper/test.html',
      },
      {
        source: '/paper/test',
        destination: '/paper/test.html',
      },
      {
        source: '/test',
        destination: '/paper/test.html',
      },
      {
        source: '/cbt',
        destination: '/paper/test.html',
      },
      {
        source: '/exam',
        destination: '/paper/test.html',
      },
      {
        source: '/home',
        destination: '/sarvottam-hero.html',
      },
    ];
  },
};

export default nextConfig;
