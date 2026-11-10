"""Official municipalities of the Región Metropolitana de Santiago.

Source: https://www.bcn.cl/siit/mapoteca/comunas
"""

import json
import unicodedata
from pathlib import Path

COMMUNES = (
    "Alhué", "Buin", "Calera de Tango", "Cerrillos", "Cerro Navia", "Colina", "Conchalí",
    "Curacaví", "El Bosque", "El Monte", "Estación Central", "Huechuraba", "Independencia",
    "Isla de Maipo", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina",
    "Lampa", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú",
    "María Pinto", "Melipilla", "Ñuñoa", "Padre Hurtado", "Paine", "Pedro Aguirre Cerda",
    "Peñaflor", "Peñalolén", "Pirque", "Providencia", "Pudahuel", "Puente Alto", "Quilicura",
    "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San José de Maipo",
    "San Miguel", "San Pedro", "San Ramón", "Santiago", "Talagante", "Tiltil", "Vitacura",
)


def key(value):
    return "".join(char for char in unicodedata.normalize("NFD", value.lower()) if not unicodedata.combining(char))


COMMUNE_NAMES = {key(name): name for name in COMMUNES}

REFERENCE_POINTS = json.loads((Path(__file__).parent / "references.json").read_text(encoding="utf-8"))
