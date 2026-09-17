const os = require('os');

function getLanIp() {
  try {
    const nets = os.networkInterfaces();
    const priorityNames = ['wi-fi', 'wifi', 'wlan', 'wireless', 'ethernet', 'eth', 'en', 'local'];

    // 1st pass: prioritize active Wi-Fi / physical Ethernet
    for (const p of priorityNames) {
      for (const name of Object.keys(nets)) {
        if (name.toLowerCase().includes(p) && !name.toLowerCase().includes('vethernet') && !name.toLowerCase().includes('virtual')) {
          for (const net of nets[name] || []) {
            if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254') && net.address !== '127.0.0.1') {
              return net.address;
            }
          }
        }
      }
    }

    // 2nd pass: any non-internal IPv4
    for (const name of Object.keys(nets)) {
      if (!name.toLowerCase().includes('vethernet') && !name.toLowerCase().includes('virtual')) {
        for (const net of nets[name] || []) {
          if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254') && net.address !== '127.0.0.1') {
            return net.address;
          }
        }
      }
    }
  } catch {}
  return 'localhost';
}

console.log(getLanIp());
