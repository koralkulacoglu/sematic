#!/usr/bin/env python3
"""
Development server runner with hot reload
"""

import os
import sys
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess
import signal
import time

class RestartHandler(FileSystemEventHandler):
    def __init__(self, command):
        self.command = command
        self.process = None
        self.restart_process()

    def restart_process(self):
        if self.process:
            self.process.terminate()
            self.process.wait()
        
        print("Starting Flask development server...")
        self.process = subprocess.Popen(self.command, shell=True)

    def on_modified(self, event):
        if event.is_directory:
            return
        
        # Only restart for Python files
        if event.src_path.endswith('.py'):
            print(f"Detected change in {event.src_path}")
            self.restart_process()

def main():
    command = f"{sys.executable} app.py"
    
    event_handler = RestartHandler(command)
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        if event_handler.process:
            event_handler.process.terminate()
    observer.join()

if __name__ == "__main__":
    main()