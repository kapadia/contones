#!flask/bin/python

import os
import argparse
import json
import inspect
import StringIO

from flask import Flask, jsonify, make_response, send_file, url_for
import numpy as np
from scipy import ndimage
from scipy.stats import scoreatpercentile
from PIL import Image
import rasterio

from contones.utilities import get_metadata, scale_image


root_dir = os.path.dirname(
    os.path.abspath(inspect.getfile(inspect.currentframe())))
static_path = os.path.join(root_dir, 'static')
app = Flask('contones', static_path=static_path)
DATA_DIR = None


@app.route('/', methods=['GET'])
def index():
    return send_file(url_for("static", filename='index.html'), mimetype="text/html")


@app.route('/static/<path:fpath>', methods=['GET'])
def get_static(fpath):
    return send_file(url_for("static", filename=fpath))


@app.route('/rasters', methods=['GET'])
def get_raster_directory():
    """Return a list of images in the user specfied directory."""

    images = filter(lambda f: os.path.splitext(
        f)[1] in ['.tif', '.tiff'], os.listdir(DATA_DIR))
    metadata = map(
        get_metadata, images, [DATA_DIR for i in range(len(images))])

    metadata_dict = {k: v for d in metadata for k, v in d.items()}
    return json.dumps(metadata_dict)


@app.route('/raster/<string:filename>', methods=['GET'])
def get_color(filename):
    """
    Get a color image.
    """

    fpath = os.path.join(DATA_DIR, "%s.tif" % filename)

    if not os.path.exists(fpath):
        return jsonify({'error': 'File does not exist'})

    with rasterio.drivers():
        with rasterio.open(fpath) as src:

            def get_band(index):
                band = src.read_band(index)
                return ndimage.interpolation.zoom(band, 0.20)

            bands = map(get_band, range(3, 0, -1))

    arr = np.dstack(bands)

    minimum = arr.min()
    maximum = arr.max()
    output = scale_image(arr, minimum, maximum)

    return send_file(output, mimetype='image/png')


@app.route('/raster/<string:filename>/<int:band_index>/<float:minimum>/<float:maximum>', methods=['GET'])
@app.route('/raster/<string:filename>/<int:band_index>/<int:minimum>/<int:maximum>', methods=['GET'])
@app.route('/raster/<string:filename>/<int:band_index>/<int:minimum>/<float:maximum>', methods=['GET'])
@app.route('/raster/<string:filename>/<int:band_index>/<float:minimum>/<int:maximum>', methods=['GET'])
def get_raster(filename, band_index, minimum, maximum):
    """
    Get a single band image.

    Possible errors:

        * File doesn't exist
        * Band doesn't exist

    """

    fpath = os.path.join(DATA_DIR, "%s.tif" % filename)

    if not os.path.exists(fpath):
        return jsonify({'error': 'File does not exist'})

    with rasterio.drivers():
        with rasterio.open(fpath) as src:

            if not band_index in map(lambda x: x + 1, range(7)):
                return jsonify({'error': 'Band index out of range'})

            band = src.read_band(band_index)

    band = ndimage.interpolation.zoom(band, 0.20)
    output = scale_image(band, minimum, maximum)

    return send_file(output, mimetype='image/png')

@app.route('/stats/histogram/<string:filename>/<int:band_index>', methods=['GET'])
def get_histogram(filename, band_index):
    """Get a histogram for a given band."""
    
    fpath = os.path.join(DATA_DIR, "%s.tif" % filename)
    
    if not os.path.exists(fpath):
        return jsonify({'error': 'File does not exist'})
    
    with rasterio.drivers():
        with rasterio.open(fpath) as src:
            
            if not band_index in map(lambda x: x + 1, range(7)):
                return jsonify({'error': 'Band index out of range'})
            
            band = src.read_band(band_index)
    
    arr = band.flatten()
    
    # Using the modified Freedman-Diaconis rule for number of bins
    iqr = scoreatpercentile(arr, 75) - scoreatpercentile(arr, 25)
    bins = 4 * iqr / np.power(arr.size, 0.333)
    
    histogram, bin_edges = np.histogram(arr, bins=bins)
    obj = {
        "counts": histogram.tolist(),
        "bin_edges": bin_edges.tolist()
    }
    
    return jsonify(obj)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description='Cloud based image viewer for larger raster data (e.g. contones).')
    parser.add_argument(
        "directory", help="specify the directory containing images to view.")
    args = parser.parse_args()

    # Make sure the data directory exists
    if os.path.exists(args.directory) is False:
        parser.print_help()
        parser.exit()

    DATA_DIR = args.directory
    app.run(debug=True)
