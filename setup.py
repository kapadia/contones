
from __future__ import print_function
from setuptools import setup, find_packages
from setuptools.command.test import test as TestCommand

import os
import sys


setup(
    name='contones',
    version='0.0.1',
    url='http://github.com/kapadia/contones/',
    license='MIT',
    author='Amit Kapadia',
    install_requires=[
        'setuptools',
        'Flask>=0.10.1',
        'Numpy',
        'Scipy',
        'rasterio'
    ],
    author_email='amit@mapbox.com',
    description='Raster image viewer for your server.',
    long_description='',
    packages=['contones'],
    package_dir={'': '.'},
    scripts = ['scripts/contones.py'],
    include_package_data=True,
    platforms='any',
    classifiers = [],
)