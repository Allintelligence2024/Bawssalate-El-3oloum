#!/usr/bin/env python3
"""Serveur de développement de la maquette « بوصلة العلوم ».

Aucun cache navigateur : chaque rechargement repart des fichiers du disque.
C'est ce qui évite les mélanges d'assets entre deux phases (v=5 / v=6).

Usage :
    python3 maquettes/serve.py          # http://0.0.0.0:8000
    python3 maquettes/serve.py 8080
"""

import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "super-bawssala")


class SansCache(http.server.SimpleHTTPRequestHandler):
    """Sert la maquette avec des en-têtes « no-store ». """

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main():
    if not os.path.isdir(RACINE):
        sys.exit("Dossier introuvable : " + RACINE)
    handler = lambda *a, **k: SansCache(*a, directory=RACINE, **k)  # noqa: E731
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), handler) as httpd:
        print("بوصلة العلوم · http://0.0.0.0:%d  (no-store)" % PORT, flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
