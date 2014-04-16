from __future__ import print_function
from setuptools import setup, find_packages
from setuptools.command.test import test as TestCommand
import io
import codecs
import os
import sys

import contones


class PyTest(TestCommand):
    def finalize_options(self):
        TestCommand.finalize_options(self)
        self.test_args = []
        self.test_suite = True

    def run_tests(self):
        import pytest
        errcode = pytest.main(self.test_args)
        sys.exit(errcode)

setup(
    name='contones',
    version=contones.__version__,
    url='http://github.com/kapadia/contones/',
    license='MIT',
    author='Amit Kapadia',
    tests_require=['pytest'],
    install_requires=[
        'setuptools',
        'Flask>=0.10.1',
        'Numpy',
        'Scipy',
        'rasterio'
    ],
    cmdclass={'test': PyTest},
    author_email='amit@mapbox.com',
    description='Raster image viewer for your server.',
    long_description='',
    packages=['contones'],
    include_package_data=True,
    platforms='any',
    test_suite='contones.test.test_contones',
    classifiers = [],
    extras_require={
        'testing': ['pytest'],
    }
)