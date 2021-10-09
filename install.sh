cd recognition/
mkdir dataset
cd ../
apt-get install python3-opencv
pip3 install opencv-python
pip3 install opencv-contrib-python
apt-get install libcblas-dev
apt-get install libhdf5-dev
apt-get install libhdf5-serial-dev
apt-get install libatlas-base-dev
apt-get install libjasper-dev 
apt-get install libqtgui4 
apt-get install libqt4-test
pip3 install flask_sqlalchemy
pip3 install sqlalchemy
pip3 install smbus
pip3 install imutils
cd static
rm -rf RealCSS
git clone https://github.com/PacCol/RealCSS.git
