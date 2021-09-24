apt-get install python3.8-venv
python3 -m venv venv
source venv/bin/activate
cd recognition/
mkdir dataset
cd ../
pip3 install -r requirements.txt
cd static
rm -rf RealCSS
git clone https://github.com/PacCol/RealCSS.git