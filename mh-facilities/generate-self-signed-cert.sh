#!/bin/bash
set -e

CERT_DIR="$(pwd)/nginx/certs"
mkdir -p "$CERT_DIR"

cat > "$CERT_DIR/openssl.cnf" <<'EOF'
[ req ]
default_bits        = 2048
prompt              = no
default_md          = sha256
distinguished_name  = dn
x509_extensions     = v3_req

[ dn ]
C = BR
ST = Sao Paulo
L = Sao Paulo
O = MH Facilities
OU = Desenvolvimento
CN = www.mhfacilities.com

[ v3_req ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = www.mhfacilities.com
DNS.2 = mhfacilities.com
EOF

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/privkey.pem" \
  -out "$CERT_DIR/fullchain.pem" \
  -config "$CERT_DIR/openssl.cnf"

echo "Certificados gerados em: $CERT_DIR"
