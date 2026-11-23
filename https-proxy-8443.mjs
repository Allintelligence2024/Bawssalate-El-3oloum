// Proxy HTTPS local : https://localhost:8443 -> http://localhost:3000 (Vite dev).
// Certificat auto-signé NON commité (plans/qa-8443.pfx, *.pfx ignoré). Régénérer :
//   $c = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "Cert:\CurrentUser\My" -FriendlyName "QA-HTTPS-8443" -NotAfter (Get-Date).AddYears(1)
//   Export-PfxCertificate -Cert $c -FilePath "plans\qa-8443.pfx" -Password (ConvertTo-SecureString -String "qa8443" -Force -AsPlainText)
import { createServer } from 'node:https';
import { readFileSync } from 'node:fs';
import { request } from 'node:http';

const pfx = readFileSync('plans/qa-8443.pfx');
const server = createServer({ pfx, passphrase: 'qa8443' }, (req, res) => {
  const headers = { ...req.headers };
  headers.host = 'localhost:3000';
  const upstream = request({ host: 'localhost', port: 3000, path: req.url, method: req.method, headers }, (up) => {
    res.writeHead(up.statusCode || 502, up.headers);
    up.pipe(res);
  });
  upstream.on('error', (e) => { res.writeHead(502); res.end('proxy error: ' + e.message); });
  req.pipe(upstream);
});
server.listen(8443, '0.0.0.0', () => console.log('HTTPS proxy listening on https://localhost:8443 -> http://localhost:3000'));
