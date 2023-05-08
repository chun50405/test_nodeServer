# 創建CA機構的過程
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem -subj "/C=TW/ST=Taiwan/L=Taipei/O=viewlead/OU=IT Department/emailAddress=chun50405@gmail.com/CN=localhost"
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

# 創建server證書的過程
openssl genrsa -out server-key.pem 2048
openssl req -new -key server-key.pem -config openssl.cnf -out server-csr.pem

openssl x509 -sha256 -req -days 9999 -CA cert.pem -CAkey key.pem -CAcreateserial -in server-csr.pem -out server-cert.pem -extensions v3_req -extfile openssl.cnf


cat cert.pem server-cert.pem > fullchain.crt
# openssl x509 -req -in server-csr.pem -CA  cert.pem -CAkey key.pem -CAcreateserial -out server-cert.pem -days 365 -sha256 -extfile openssl.cnf
