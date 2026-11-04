#!/usr/bin/env python3
"""Compatibility entry point; all program facts are authored in program.json."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('sync-program.py')),run_name='__main__')
