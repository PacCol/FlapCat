python3 -m venv venv
source venv/bin/activate
cd recognition/
mkdir dataset
cd ../
pip3 install -r requirements.txt
cd static
rmdir RealCSS
git clone https://github.com/PacCol/RealCSS.git