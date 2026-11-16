import socket
import base64
import os
import json
import urllib.request
import subprocess
import time

class SimpleWebSocket:
    def __init__(self, host, port, path):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((host, port))
        sec_key = base64.b64encode(os.urandom(16)).decode('utf-8')
        handshake = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}:{port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {sec_key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(handshake.encode('utf-8'))
        resp = self.sock.recv(4096).decode('utf-8')
        if "101" not in resp:
            raise RuntimeError(f"WebSocket handshake failed: {resp}")

    def send(self, data):
        payload = data.encode('utf-8')
        length = len(payload)
        header = bytearray([0x81])
        mask = os.urandom(4)
        if length <= 125:
            header.append(0x80 | length)
        elif length <= 65535:
            header.append(0x80 | 126)
            header.extend(length.to_bytes(2, 'big'))
        else:
            header.append(0x80 | 127)
            header.extend(length.to_bytes(8, 'big'))
        header.extend(mask)
        masked_payload = bytearray(payload[i] ^ mask[i % 4] for i in range(length))
        self.sock.sendall(header + masked_payload)

    def recv(self, timeout=5.0):
        self.sock.settimeout(timeout)
        try:
            head = self.sock.recv(2)
            if not head:
                return None
            b1, b2 = head[0], head[1]
            masked = (b2 & 0x80) != 0
            payload_len = b2 & 0x7f
            if payload_len == 126:
                payload_len = int.from_bytes(self.sock.recv(2), 'big')
            elif payload_len == 127:
                payload_len = int.from_bytes(self.sock.recv(8), 'big')
            mask = self.sock.recv(4) if masked else None
            data = bytearray()
            while len(data) < payload_len:
                chunk = self.sock.recv(payload_len - len(data))
                if not chunk:
                    break
                data.extend(chunk)
            if masked:
                data = bytearray(data[i] ^ mask[i % 4] for i in range(len(data)))
            return data.decode('utf-8', errors='replace')
        except socket.timeout:
            return None

    def close(self):
        self.sock.close()

proc = subprocess.Popen([
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    'http://localhost:8089/index.html'
], stderr=subprocess.PIPE, stdout=subprocess.PIPE)

time.sleep(2)
try:
    tabs = json.loads(urllib.request.urlopen('http://localhost:9222/json').read().decode())
    target = next(t for t in tabs if '8089' in t.get('url', ''))
    ws_url = target['webSocketDebuggerUrl']
    parts = ws_url.replace("ws://", "").split("/", 1)
    host, port = parts[0].split(":")
    ws = SimpleWebSocket(host, int(port), "/" + parts[1])

    msg_id = 1
    def call_cdp(method, params=None):
        global msg_id
        curr_id = msg_id
        msg_id += 1
        ws.send(json.dumps({"id": curr_id, "method": method, "params": params or {}}))
        while True:
            msg = ws.recv(timeout=3.0)
            if not msg:
                return None
            data = json.loads(msg)
            if data.get("id") == curr_id:
                return data

    res = call_cdp("Runtime.evaluate", {
        "expression": """
        (async () => {
            try {
                await import('./js/app.js');
                return { success: true, hasApp: Boolean(window.edexcelApp) };
            } catch(e) {
                return { success: false, error: e.message, stack: e.stack };
            }
        })()
        """,
        "returnByValue": True,
        "awaitPromise": True
    })
    print("Module import result:", json.dumps(res, indent=2))

finally:
    ws.close()
    proc.terminate()
