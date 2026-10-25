"""Prüft kurze, dokumentierte Funktionen in projekteeigenen Python-Skripten."""
import ast
from pathlib import Path


def check_file(path):
    """Prüft Dateilänge und Funktionen. Parameter: path – Quelldatei."""
    source = path.read_text(encoding='utf-8')
    assert len(source.splitlines()) <= 450, f'{path}: mehr als 450 LOC'
    for node in ast.walk(ast.parse(source)):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            assert node.end_lineno-node.lineno+1 <= 20, f'{path}: {node.name} länger als 20 LOC'
            assert ast.get_docstring(node), f'{path}: {node.name} ohne deutschen Docstring'


def main():
    """Prüft alle Python-Dateien im Skriptordner."""
    root = Path(__file__).resolve().parents[1]
    for path in root.rglob('*.py'):
        check_file(path)
    print('OK: Python-Dateien maximal 450 LOC, Funktionen maximal 20 LOC und dokumentiert.')


if __name__ == '__main__':
    main()
