docker build -t flask-container .

aws lightsail push-container-image --region us-west-2 --service-name nft-service --image flask-container --label flask-container