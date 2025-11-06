from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

try:
    from core.views.common.utils import add_cors_headers
except Exception:
    add_cors_headers = None

# Muestra de datos para probar el front. Sustituye por tu consulta real cuando quieras.
_SAMPLE = [
    {
        "Vulnerability ID": "S-0001",
        "Vulnerability Title": "Outdated library",
        "State": "Open",
        "Severity": "High",
        "CVSS Overall": 7.8,
        "IT Owner": "Alice",
        "Hostname": "srv-01",
        "Detection Date": "2025-01-05",
        "Resolution Date": "",
        "dueDate": "2025-02-10",
        "Countermeasure": "Update dependency",
        "Category ASVS": "V1",
        "ASVS ID": "1.1",
        "OWASP TOP 10": "A06",
        "Domain": "corp",
    },
    {
        "Vulnerability ID": "S-0002",
        "Vulnerability Title": "Weak TLS",
        "State": "In Progress",
        "Severity": "Medium",
        "CVSS Base": 5.6,
        "Detection team": "Blue",
        "Application": "Portal",
        "Detection Date": "2025-01-20",
        "Production Date": "",
        "dueDate": "2025-03-01",
        "Countermeasure": "Harden TLS",
        "Category ASVS": "V2",
        "ASVS ID": "2.3",
        "OWASP TOP 10": "A02",
        "Network": "dmz",
    },
    {
        "Vulnerability ID": "S-0003",
        "Vulnerability Title": "Default creds",
        "State": "Open",
        "Severity": "Critical",
        "EPSS": 0.9,
        "SW Provider": "Vendor X",
        "Nombre Aplicación": "API",
        "Actualizacion estado": "2025-02-01",
        "Fecha mitigacion": "",
        "dueDate": "2025-02-05",
        "Countermeasure": "Rotate credentials",
        "Category ASVS": "V3",
        "ASVS ID": "3.2",
        "OWASP TOP 10": "A07",
        "Domain": "corp",
    },
]

@csrf_exempt
def soup_get_risk_data(request):
    resp = JsonResponse(_SAMPLE, safe=False)
    if add_cors_headers:
        resp = add_cors_headers(resp)
    return resp
