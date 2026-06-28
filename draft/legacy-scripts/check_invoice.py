with open('D:/meter/Meter/Frontend/invoice-improved.pdf', 'rb') as f:
    d = f.read()
    print(f'Size: {len(d):,} bytes')
    print(f'Header: {d[:50]}')
    is_pdf = d[:5] == b'%PDF-'
    print(f'Valid PDF: {is_pdf}')
    trailer = d.find(b'%%EOF')
    if trailer >= 0:
        print(f'Trailer at offset {trailer}')
