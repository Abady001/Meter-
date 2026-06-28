import os
path = 'D:/meter/Meter/Frontend/solar-invoice-test.pdf'
size = os.path.getsize(path)
with open(path, 'rb') as f:
    header = f.read(5)
is_pdf = header == b'%PDF-'
print(f'PDF size: {size} bytes')
print(f'Header: {header}')
print(f'Valid PDF: {is_pdf}')
