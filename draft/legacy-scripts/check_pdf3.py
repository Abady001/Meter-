with open('D:/meter/Meter/Frontend/pdf-test-result.pdf', 'rb') as f:
    d = f.read()
    is_pdf = d[:5] == b'%PDF-'
    print(f'Size: {len(d):,} bytes')
    print(f'Header: {d[:50]}')
    print(f'Is PDF: {is_pdf}')
    idx = d.find(b'%%EOF')
    if idx >= 0:
        print(f'Trailer at offset {idx}')
    print(f'First 5 hex: {d[:5].hex()}')
