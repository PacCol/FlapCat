import os

def fix():
    if not os.path.isdir("recognition/dataset/"):
        os.mkdir("recognition/dataset/")