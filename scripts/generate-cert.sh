#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

# Определяем локальный IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP="127.0.0.1"
fi
echo "Generating SSL certificate for localhost and IP: $LOCAL_IP..."

# 1. Генерация CA ключа и сертификата (Центр сертификации)
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -sha256 -days 365 -out ca.crt \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=SystemComponents/OU=Dev/CN=Local-Dev-CA"

# 2. Генерация приватного ключа сервера
openssl genrsa -out cert.key 2048

# 3. Конфиг для запроса сертификата с SAN (Subject Alternative Names)
cat << SSL_CONF > cert.ext
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = $LOCAL_IP
SSL_CONF

# 4. Генерация CSR
openssl req -new -key cert.key -out cert.csr \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=SystemComponents/OU=Dev/CN=localhost"

# 5. Подпись сертификата локальным CA
openssl x509 -req -in cert.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out cert.crt -days 365 -sha256 -extfile cert.ext

rm -f cert.csr cert.ext ca.srl

echo "SSL certificates generated successfully:"
echo "  - ca.crt, ca.key (Local Certificate Authority)"
echo "  - cert.crt, cert.key (Server Certificate and Private Key for localhost & $LOCAL_IP)"
