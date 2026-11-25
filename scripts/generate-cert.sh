#!/bin/bash
set -euo pipefail
umask 077

cd "$(dirname "${BASH_SOURCE[0]}")/.."
LOCAL_IP="${1:-}"
if [ -z "$LOCAL_IP" ]; then
  if command -v ipconfig >/dev/null 2>&1; then
    NETWORK_INTERFACE=$(route -n get default 2>/dev/null | awk '/interface:/ {print $2; exit}')
    LOCAL_IP=$(ipconfig getifaddr "${NETWORK_INTERFACE:-en0}" || true)
  elif command -v ip >/dev/null 2>&1; then
    LOCAL_IP=$(ip -4 route get 1.1.1.1 | awk '{for (i=1;i<NF;i++) if ($i=="src") {print $(i+1); exit}}')
  fi
fi
if ! [[ "$LOCAL_IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
  echo "Укажите IPv4 ноутбука: npm run generate-cert -- 192.168.1.42" >&2
  exit 1
fi

TEMP_CERT_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_CERT_DIR"' EXIT

if [ ! -f ca.key ] || [ ! -f ca.crt ]; then
  openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
    -keyout ca.key -out ca.crt -subj "/CN=System Components Local CA" \
    -config <(printf '[req]\ndistinguished_name=dn\n[dn]\n[ca]\nbasicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\nsubjectKeyIdentifier=hash\n') \
    -extensions ca
fi

cat > "$TEMP_CERT_DIR/server.ext" <<CONF
authorityKeyIdentifier=keyid,issuer
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$LOCAL_IP
CONF

openssl req -new -newkey rsa:2048 -nodes -keyout "$TEMP_CERT_DIR/cert.key" \
  -out "$TEMP_CERT_DIR/server.csr" -subj "/CN=localhost"
openssl x509 -req -in "$TEMP_CERT_DIR/server.csr" -CA ca.crt -CAkey ca.key \
  -CAserial "$TEMP_CERT_DIR/ca.srl" -CAcreateserial -out "$TEMP_CERT_DIR/cert.crt" \
  -days 180 -sha256 -extfile "$TEMP_CERT_DIR/server.ext"
mv "$TEMP_CERT_DIR/cert.key" "$TEMP_CERT_DIR/cert.crt" .
echo "HTTPS: https://$LOCAL_IP:8443. Установите ca.crt как доверенный CA на телефоне."
