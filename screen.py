import time
import socket
import config

if config.raspberryPi:
    import smbus

I2C_ADDR = 0x27
LCD_WIDTH = 20
LCD_CHR = 1
LCD_CMD = 0
LCD_LINE_1 = 1
LCD_LINE_2 = 2
LCD_LINE_3 = 3
LCD_LINE_4 = 4
LCD_BACKLIGHT = 0x08
ENABLE = 0b00000100
E_PULSE = 0.0005
E_DELAY = 0.0005


def lcdInit():
    global bus
    bus = smbus.SMBus(1)
    lcdByte(0x33, LCD_CMD)
    lcdByte(0x32, LCD_CMD)
    lcdByte(0x06, LCD_CMD)
    lcdByte(0x0C, LCD_CMD)
    lcdByte(0x28, LCD_CMD)
    lcdByte(0x01, LCD_CMD)
    time.sleep(E_DELAY)


def lcdByte(bits, mode):
    bits_high = mode | (bits & 0xF0) | LCD_BACKLIGHT
    bits_low = mode | ((bits << 4) & 0xF0) | LCD_BACKLIGHT
    bus.write_byte(I2C_ADDR, bits_high)
    lcdToggleEnable(bits_high)
    bus.write_byte(I2C_ADDR, bits_low)
    lcdToggleEnable(bits_low)


def lcdToggleEnable(bits):
    time.sleep(E_DELAY)
    bus.write_byte(I2C_ADDR, (bits | ENABLE))
    time.sleep(E_PULSE)
    bus.write_byte(I2C_ADDR, (bits & ~ENABLE))
    time.sleep(E_DELAY)


def lcdString(message, line):
    if config.raspberryPi:
        if line == 1:
            line = 0x80
        elif line == 2:
            line = 0xC0
        elif line == 3:
            line = 0x94
        elif line == 4:
            line = 0xD4
        message = message.ljust(LCD_WIDTH, " ")
        lcdByte(line, LCD_CMD)
        for i in range(LCD_WIDTH):
            lcdByte(ord(message[i]), LCD_CHR)


def getIp():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
    except:
        return "??"
    ipAddress = s.getsockname()[0]
    s.close()
    return ipAddress


def showHomeScreen():
    lcdString("FlapCat - Bienvenue", 1)
    lcdString("Pour configurer ->", 3)
    ip = getIp()
    lcdString("http://" + ip, 4)


if config.raspberryPi:
    lcdInit()

showHomeScreen()
