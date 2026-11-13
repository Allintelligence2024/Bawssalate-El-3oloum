import base64, sys

# The file content encoded as base64 to avoid all escaping issues
encoded = "Ly_2aXQgc2hhc2h0ZSBhbHFhbmFpZ2kg8Y_h6I1lciBCTw==="
content = base64.b64decode(encoded).decode('utf-8')
print(f"Decoded {len(content)} chars")
print(content[:100])
