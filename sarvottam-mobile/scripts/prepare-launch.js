const os = require('os');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

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

async function main() {
  const lanIp = getLanIp();
  const webUrl = `http://${lanIp}:8081`;
  const expoUrl = `exp://${lanIp}:8081`;
  const localUrl = 'http://localhost:8081';

  try {
    const qrWeb = await QRCode.toDataURL(webUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#050b17', light: '#ffffff' }
    });

    const qrExpo = await QRCode.toDataURL(expoUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#050b17', light: '#ffffff' }
    });

    const config = {
      lanIp,
      port: 8081,
      webUrl,
      expoUrl,
      localUrl,
      qrWeb,
      qrExpo,
      updatedAt: new Date().toISOString()
    };

    const targetPath = path.resolve(__dirname, '../../app-network-config.json');
    fs.writeFileSync(targetPath, JSON.stringify(config, null, 2), 'utf8');

    console.log(lanIp);
  } catch (err) {
    console.error('Failed to generate network config:', err);
    console.log(lanIp);
  }
}

main();
